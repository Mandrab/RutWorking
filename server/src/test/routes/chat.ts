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

const PROJECTS = [
    {
        name: 'project1',
        chief: {
            email: 'chief@chief.chief'
        },
        modules: [
            'module1',
            'module2'
        ]
    }, {
        name: 'project2',
        chief: {
            email: 'chief@chief.chief'
        },
        modules: [
            'module1',
            'module2'
        ]
    }
]
const DEVELOPER = {
    email: 'developer@developer.developer'
}
const RANDOM_USER = {
    email: 'user@user.user'
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
            register('x', 'y', PROJECTS[0].chief.email, 'z', Roles.USER),
            // add an initial developer
            register('x', 'y', DEVELOPER.email, 'z', Roles.USER),
            // add an initial user
            register('x', 'y', RANDOM_USER.email, 'z', Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: PROJECTS[0].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: DEVELOPER.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: RANDOM_USER.email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[1].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    CHAT POST
**********************************************************************************************************************/

    it('test chat posting', async function() {
        let chief = await User.findByEmail(PROJECTS[0].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(DEVELOPER.email)
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let randomUser = await User.findByEmail(RANDOM_USER.email)
        let randomUserToken = sign({ id: randomUser._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECTS[0].name, chief: chief._id(), modules: [{
            name: PROJECTS[0].modules[0],
            chief: chief._id(),
            developers: [developer._id()],
            chatMessages: [],
            kanbanItems: []
        }] }).save()

        // no token
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0] + '/messages')
            .expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0] + '/messages')
            .set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0] +'/messages')
            .set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.post('/projects/' + PROJECTS[0].name + '/modules/FAKE' + PROJECTS[0].modules[0] +'/messages')
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no body
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0] + '/messages')
            .set({ 'Authorization': chiefToken }).expect(409)

        // valid token chief
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0] + '/messages')
            .set({ 'Authorization': chiefToken }).send({ message: 'qwerty' }).expect(201)
        
        // valid token developer
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0] + '/messages')
            .set({ 'Authorization': developerToken }).send({ message: 'asd' }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    CHAT GET
**********************************************************************************************************************/

    it('get', async function() {
        let chief = await User.findByEmail(PROJECTS[1].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(DEVELOPER.email)
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let randomUser = await User.findByEmail(RANDOM_USER.email)
        let randomUserToken = sign({ id: randomUser._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECTS[1].name, chief: chief._id(), modules: [{
            name: PROJECTS[1].modules[0],
            chief: chief._id(),
            developers: [ developer._id() ],
            chatMessages: [],
            kanbanItems: []
        }] }).save()
        let project = await Project.findByName(PROJECTS[1].name)
        let module = project.modules().find(it => it.name() === PROJECTS[1].modules[0])
        await module.newMessage(developer._id(), 'qwerty')
        await module.newMessage(chief._id(), 'asd')

        // no token
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0] + '/messages')
            .expect(500).expect('Token has not been passed!')

        // no developer
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0] + '/messages')
            .set({ 'Authorization': randomUserToken }).expect(403)
        
        // no such project
        await request.get('/projects/FAKE' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0] + '/messages')
            .set({ 'Authorization': developerToken }).expect(404)
        
        // no such module
        await request.get('/projects/' + PROJECTS[1].name + '/modules/FAKE' + PROJECTS[1].modules[0] + '/messages')
            .set({ 'Authorization': developerToken }).expect(404)

        let res = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0] + '/messages')
            .set({ 'Authorization': developerToken }).expect(200)

        let initialMessagesN = res.body.length
        if (initialMessagesN < 2) throw 'Wrong number of messages returned'

        if (!res.body.some((it: { message: string }) => it.message === 'qwerty'))
            throw 'A message not appear in return!'
        if (!res.body.some((it: { message: string }) => it.message === 'asd'))
            throw 'A message not appear in return!'
        
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0] + '/messages')
            .set({ 'Authorization': chiefToken }).expect(200)

        // skip first
        res = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0] + '/messages/1')
            .set({ 'Authorization': developerToken }).expect(200)
        if (res.body.length !== initialMessagesN -1) throw 'Wrong number of messages returned'

        return Promise.resolve()
    })
})