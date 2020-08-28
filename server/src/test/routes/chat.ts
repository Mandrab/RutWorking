/**
 * Tests chat routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import assert from 'assert'
import { connect } from 'mongoose'
import { Roles, Project } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'
import { TestProjectBuilders } from '../utils/TestProject'
import { TestUser } from '../utils/TestUser'
import { TestClass } from '../utils/TestClass'

const request = require('supertest')('http://localhost:8080')

const DEVELOPER = new TestUser('developer@developer.developer')
const RANDOM_USER = new TestUser('user@user.user')
const PROJECTS = TestClass.associativeArray(
    ['post', 'get'],
    (idx: number) => {
        return TestProjectBuilders.new('project' + idx, 'chief@chief.chief')
            .addModule('module1', 'chief@chief.chief', [DEVELOPER])
            .addModule('module2', 'chief@chief.chief')
            .build()
    }
)

describe('test chats\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all(Object.values(PROJECTS).map(it => it.registerAll()))
        await DEVELOPER.register(Roles.USER),         // add an initial developer
        await RANDOM_USER.register(Roles.USER)        // add an initial user
    })

    after(async function() { return clean() })

    var clean = async () => {
        await Promise.all(Object.values(PROJECTS).map(it => it.deleteAll()))
        await DEVELOPER.delete(),
        await RANDOM_USER.delete()
    }

/**********************************************************************************************************************
    CHAT POST
**********************************************************************************************************************/

    it('post', async function() {
        let chiefToken = await PROJECTS['post'].chief.getToken()
        let developerToken = await DEVELOPER.getToken()
        let randomUserToken = await RANDOM_USER.getToken()

        // no token
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/messages').expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/messages').set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/messages').set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/FAKE' + PROJECTS['post'].modules[0].name
            +'/messages').set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no body
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/messages').set({ 'Authorization': chiefToken }).expect(409)

        // valid token chief
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/messages').set({ 'Authorization': chiefToken }).send({ message: 'qwerty' }).expect(201)
        
        // valid token developer
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/messages').set({ 'Authorization': developerToken }).send({ message: 'asd' }).expect(201)
    })

/**********************************************************************************************************************
    CHAT GET
**********************************************************************************************************************/

    it('get', async function() {
        let chiefToken = await PROJECTS['post'].chief.getToken()
        let developerToken = await DEVELOPER.getToken()
        let randomUserToken = await RANDOM_USER.getToken()

        let project = await Project.findByName(PROJECTS['get'].name)
        let module = project.modules().find(it => it.name() === PROJECTS['get'].modules[0].name)
        await module.newMessage((await DEVELOPER.getUser())._id(), 'qwerty')
        await module.newMessage((await PROJECTS['get'].chief.getUser())._id(), 'asd')

        // no token
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/messages').expect(500).expect('Token has not been passed!')

        // no developer
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/messages').set({ 'Authorization': randomUserToken }).expect(403)
        
        // no such project
        await request.get('/projects/FAKE' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/messages').set({ 'Authorization': developerToken }).expect(404)
        
        // no such module
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/FAKE' + PROJECTS['get'].modules[0].name
            + '/messages').set({ 'Authorization': developerToken }).expect(404)

        let res = await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/messages').set({ 'Authorization': developerToken }).expect(200)

        let initialMessagesN = res.body.length
        assert(initialMessagesN >= 2, 'Wrong number of messages returned')
        assert(res.body.some((it: { message: string }) => it.message === 'qwerty'), 'A message not appear in return!')
        assert(res.body.some((it: { message: string }) => it.message === 'asd'), 'A message not appear in return!')
        
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/messages').set({ 'Authorization': chiefToken }).expect(200)

        // skip first
        res = await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/messages/1').set({ 'Authorization': developerToken }).expect(200)
        assert(res.body.length === initialMessagesN -1, 'Wrong number of messages returned')
    })
})