/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from "mongoose"
import { register, Roles, User } from "../../main/models"
import { DBUser, DBProject } from "../../main/models/db"
import { config as dbConfig } from '../../main/config/db'
import { sign } from "jsonwebtoken"
import { secret } from "../../main/config/auth"

const request = require('supertest')('http://localhost:8080')

const CHIEF = {
    email: 'chief@chief.chief',
    passwd: 'chief',
    project: {
        name: 'project',
        modules: [
            'module1',
            'module2'
        ]
    }
}
const DEVELOPER = {
    email: 'developer@developer.developer',
    passwd: 'user'
}
const RANDOM_USER = {
    email: 'user@user.user',
    passwd: 'user'
}

describe('test chats\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all([
            // add an initial chief.. if yet exist ok!
            register(CHIEF.email, CHIEF.passwd, Roles.USER),
            // add an initial developer
            register(DEVELOPER.email, DEVELOPER.passwd, Roles.USER),
            // add an initial user
            register(RANDOM_USER.email, RANDOM_USER.passwd, Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: CHIEF.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: DEVELOPER.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: RANDOM_USER.email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: CHIEF.project.name }) } catch (_) { }
    }

/**********************************************************************************************************************
    CHAT POST
**********************************************************************************************************************/

    it('test chat posting', async function() {
        let chief = await User.findByEmail(CHIEF.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(DEVELOPER.email)
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let randomUser = await User.findByEmail(RANDOM_USER.email)
        let randomUserToken = sign({ id: randomUser._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: CHIEF.project.name, chief: chief._id(), modules: [{
            name: CHIEF.project.modules[0],
            chief: chief._id(),
            developers: [developer._id()],
            chatMessages: [],
            kanbanItems: []
        }] }).save()

        // no token
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0] + '/messages')
            .expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0] + '/messages')
            .set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0] +'/messages')
            .set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.post('/projects/' + CHIEF.project.name + '/modules/FAKE' + CHIEF.project.modules[0] +'/messages')
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no body
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0] + '/messages')
            .set({ 'Authorization': chiefToken }).expect(409)

        // valid token chief
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0] + '/messages')
            .set({ 'Authorization': chiefToken }).send({ message: 'qwerty' }).expect(201)
        
        // valid token developer
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0] + '/messages')
            .set({ 'Authorization': developerToken }).send({ message: 'asd' }).expect(201)

        return Promise.resolve()
    })
})