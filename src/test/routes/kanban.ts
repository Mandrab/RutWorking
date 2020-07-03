/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from "mongoose"
import { register, Roles, User, Project } from "../../main/models"
import { DBUser, DBProject } from "../../main/models/db"
import { config as dbConfig } from '../../main/config/db'
import { sign } from "jsonwebtoken"
import { secret } from "../../main/config/auth"

const request = require('supertest')('http://localhost:8080')

const PROJECT = [
    {
        name: 'project1',
        modules: [
            'module1',
            'module2'
        ],
        chief: {
            email: 'chief@chief.chief',
            passwd: 'chief',
        }
    }, {
        name: 'project2',
        modules: [
            'module1',
            'module2'
        ],
        chief: {
            email: 'chief@chief.chief',
            passwd: 'chief',
        }
    }
]
const DEVELOPER = {
    email: 'developer@developer.developer',
    passwd: 'user'
}
const RANDOM_USER = {
    email: 'user@user.user',
    passwd: 'user'
}

describe('test kanban\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all([
            // add an initial chief.. if yet exist ok!
            register(PROJECT[0].chief.email, PROJECT[0].chief.passwd, Roles.USER),
            // add an initial developer
            register(DEVELOPER.email, DEVELOPER.passwd, Roles.USER),
            // add an initial user
            register(RANDOM_USER.email, RANDOM_USER.passwd, Roles.USER)
        ])
    })

    //after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: PROJECT[0].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: DEVELOPER.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: RANDOM_USER.email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[1].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    KANBAN POST
**********************************************************************************************************************/

    it('test kanban posting', async function() {
        let chief = await User.findByEmail(PROJECT[0].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(DEVELOPER.email)
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let randomUser = await User.findByEmail(RANDOM_USER.email)
        let randomUserToken = sign({ id: randomUser._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECT[0].name, chief: chief._id(), modules: [{
            name: PROJECT[0].modules[0],
            chief: chief._id(),
            developers: [developer._id()],
            chatMessages: [],
            kanbanItems: []
        }] }).save()

        // no token
        await request.post('/projects/' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] + '/kanban')
            .expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] + '/kanban')
            .set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] +'/kanban')
            .set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.post('/projects/' + PROJECT[0].name + '/modules/FAKE' + PROJECT[0].modules[0] +'/kanban')
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no body
        await request.post('/projects/' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] + '/kanban')
            .set({ 'Authorization': chiefToken }).expect(409)

        // valid token chief
        await request.post('/projects/' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] + '/kanban')
            .set({ 'Authorization': chiefToken }).send({ description: 'qwerty' }).expect(201)
        
        // valid token but developer
        await request.post('/projects/' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).send({ description: 'asd' }).expect(403)

        // new task
        await request.post('/projects/' + PROJECT[0].name + '/modules/' + PROJECT[0].modules[0] + '/kanban')
            .set({ 'Authorization': chiefToken }).send({ description: 'qwerty' }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    KANBAN UPDATE
**********************************************************************************************************************/

    it('test kanban updating', async function() {
        let chief = await User.findByEmail(PROJECT[1].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(DEVELOPER.email)
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let randomUser = await User.findByEmail(RANDOM_USER.email)
        let randomUserToken = sign({ id: randomUser._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECT[1].name, chief: chief._id(), modules: [{
            name: PROJECT[1].modules[0],
            chief: chief._id(),
            developers: [ developer._id() ],
            chatMessages: [],
            kanbanItems: []
        }] }).save()
        let project = await Project.findByName(PROJECT[1].name)
        let module = project.modules().find(it => it.name() === PROJECT[1].modules[0])
        await module.newTask('qwerty')
        await module.newTask('asd')
        await project.refresh()
        await module.refresh()
        let task1ID = module.kanbanItems()[0]._id()
        let task2ID = module.kanbanItems()[1]._id()

        // no kanban item id
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban')
            .expect(404)

        // no token
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.put('/projects/FAKE' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] +'/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.put('/projects/' + PROJECT[1].name + '/modules/FAKE' + PROJECT[1].modules[0] +'/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no body
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).expect(409)

        // valid token chief
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).send({ newState: 'IN-PROGRESS' }).expect(200)

        // valid token developer
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task2ID)
            .set({ 'Authorization': developerToken }).send({ newState: 'DONE' }).expect(200)

        return Promise.resolve()
    })
})