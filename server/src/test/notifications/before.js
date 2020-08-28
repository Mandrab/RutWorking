/**
 * Create item used for 'notifications' test
 * 
 * @author Paolo Baldini
 */
const connect = require('mongoose')
const db = require('../../../build/main/config/db')
const models = require('../../../build/main/models')
const dbModels = require('../../../build/main/models/db')

const PROJECT = {
    name: 'project',
    modules: [ 'module' ]
}
const USER = {
    email: 'ADMIN_EMAIL',
    password: 'ADMIN_PASSWORD'
}

const setup = async () => {
    // connect to db
    await connect.connect(`mongodb://${db.config.HOST}:${db.config.PORT}/${db.config.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    // create user
    try { await dbModels.DBUser.deleteOne({ email: USER.email }) } catch (_) { }
    await models.register('x', 'y', USER.email, USER.password, models.Roles.USER).catch((err) => {
        if (err.code !== 406) throw err
    })
    let user = await models.User.findByEmail(USER.email)

    // create project
    try { await dbModels.DBProject.deleteOne({ name: PROJECT.name }) } catch (_) { }
    await new dbModels.DBProject({ name: PROJECT.name, chief: user._id(), modules: [{
        name: PROJECT.modules[0],
        chief: user._id(),
        developers: [user._id()],
        chatMessages: [],
        kanbanItems: []
    }] }).save()

    // create messages
    let project = await models.Project.findByName(PROJECT.name)
    let module = project.modules().find(it => it.name() === PROJECT.modules[0])
    await module.newMessage(user._id(), ':P')
    await module.newMessage(user._id(), ':D')

    console.log('DB setup completed')
    process.exit()
}

setup()