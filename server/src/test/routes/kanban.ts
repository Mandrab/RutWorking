/**
 * Tests kanban routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import assert from 'assert'
import { connect } from 'mongoose'
import { Roles, Project } from '../../main/models'
import { States } from '../../main/models/db'
import { config as dbConfig } from '../../main/config/db'
import { TestProjectBuilders } from '../utils/TestProject'
import { TestUser } from '../utils/TestUser'
import { TestClass } from '../utils/TestClass'
import { equals } from '../utils/Collection'

const request = require('supertest')('http://localhost:8080')

const DEVELOPER = new TestUser('developer@developer.developer')
const RANDOM_USER = new TestUser('user@user.user')
const PROJECTS = TestClass.associativeArray(
    ['post', 'update', 'delete', 'get'],
    (idx: number) => {
        return TestProjectBuilders.new('project' + idx, 'chief@chief.chief')
            .addModule('module1', 'chief@chief.chief', [DEVELOPER])
            .addModule('module2', 'chief@chief.chief', [DEVELOPER])
            .build()
    }
)

describe('test kanbans\' operations', function() {
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
    KANBAN POST
**********************************************************************************************************************/

    it('post', async function() {
        let chiefToken = await PROJECTS['post'].chief.getToken()
        let developerToken = await DEVELOPER.getToken()
        let randomUserToken = await RANDOM_USER.getToken()

        // no token
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/kanban').expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/kanban').set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            +'/kanban').set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/FAKE' + PROJECTS['post'].modules[0].name
            +'/kanban').set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no name
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/kanban').set({ 'Authorization': chiefToken }).send({ description: 'qwerty' }).expect(409)

        // valid token chief
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/kanban').set({ 'Authorization': chiefToken }).send({ name: 'qwerty', description: '' }).expect(201)

        // valid token but developer
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/kanban').set({ 'Authorization': developerToken }).send({ description: 'asd' }).expect(403)

        // new task
        await request.post('/projects/' + PROJECTS['post'].name + '/modules/' + PROJECTS['post'].modules[0].name
            + '/kanban').set({ 'Authorization': chiefToken }).send({ name: 'qwerty', description: '' }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    KANBAN UPDATE
**********************************************************************************************************************/

    it('update', async function() {
        let chiefToken = await PROJECTS['update'].chief.getToken()
        let developerToken = await DEVELOPER.getToken()
        let randomUserToken = await RANDOM_USER.getToken()

        let project = await Project.findByName(PROJECTS['update'].name)
        let module = project.modules().find(it => it.name() === PROJECTS['update'].modules[0].name)
        await module.newTask('qwerty')
        await module.newTask('asd')
        await module.refresh()
        let task1ID = module.kanbanItems()[0]._id()
        let task2ID = module.kanbanItems()[1]._id()

        // no kanban item id
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban').expect(404)

        // no token
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).set({ 'Authorization': randomUserToken }).expect(403)

        // no project
        await request.put('/projects/FAKE' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            +'/kanban/' + task1ID).set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/FAKE' + PROJECTS['update'].modules[0].name
            +'/kanban/' + task1ID).set({ 'Authorization': chiefToken }).expect(404)

        // valid token chief but no body
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).set({ 'Authorization': chiefToken }).expect(409)

        // no assignee specified
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).set({ 'Authorization': chiefToken }).send({ newState: 'IN-PROGRESS' }).expect(404)

        // invalid assignee
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).set({ 'Authorization': chiefToken })
            .send({ newState: 'IN-PROGRESS', assignee: RANDOM_USER.email }).expect(409)

        await module.refresh()
        let items = module.kanbanItems().filter(it => equals(it._id(), task1ID))
        assert(!items[0].assigneeID(), 'Task assignee present!')

        // valid token chief
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).set({ 'Authorization': chiefToken })
            .send({ newState: 'IN-PROGRESS', assignee: DEVELOPER.email }).expect(200)

        // valid token developer
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task2ID).set({ 'Authorization': developerToken })
            .send({ newState: 'DONE', assignee: DEVELOPER.email }).expect(200)
        await module.refresh()
        items = module.kanbanItems().filter(it => equals(it._id(), task1ID))
        assert(items[0].assigneeID(), 'Task assignee not present!')

        // TO-DO does not need an assignee
        await request.put('/projects/' + PROJECTS['update'].name + '/modules/' + PROJECTS['update'].modules[0].name
            + '/kanban/' + task1ID).set({ 'Authorization': chiefToken }).send({ newState: 'TO-DO' }).expect(200)
        await module.refresh()
        items = module.kanbanItems().filter(it => equals(it._id(), task1ID))
        assert(items[0].status() === States.TODO && !items[0].assigneeID(), 'Incorrect task!')

        return Promise.resolve()
    })

/**********************************************************************************************************************
    KANBAN DELETE
**********************************************************************************************************************/

    it('delete', async function() {
        let chiefToken = await PROJECTS['delete'].chief.getToken()
        let randomUserToken = await RANDOM_USER.getToken()

        let module = (await Project.findByName(PROJECTS['delete'].name))
            .modules().find(it => it.name() === PROJECTS['delete'].modules[0].name)
        await module.newTask('qwerty')
        await module.newTask('asd')
        await module.refresh()
        let taskID = module.kanbanItems()[1]._id()

        // no project
        await request.delete('/projects/FAKE' + PROJECTS['delete'].name + '/modules/' + PROJECTS['delete'].modules[0]
            .name +'/kanban/' + taskID).set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.delete('/projects/' + PROJECTS['delete'].name + '/modules/FAKE' + PROJECTS['delete'].modules[0]
            .name +'/kanban/' + taskID).set({ 'Authorization': chiefToken }).expect(404)

        // no kanban item id
        await request.delete('/projects/' + PROJECTS['delete'].name + '/modules/' + PROJECTS['delete'].modules[0].name
            + '/kanban').expect(404)

        // no token
        await request.delete('/projects/' + PROJECTS['delete'].name + '/modules/' + PROJECTS['delete'].modules[0].name
            + '/kanban/' + taskID).expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.delete('/projects/' + PROJECTS['delete'].name + '/modules/' + PROJECTS['delete'].modules[0].name
            + '/kanban/' + taskID).set({ 'Authorization': randomUserToken }).expect(403)

        // valid token chief
        await request.delete('/projects/' + PROJECTS['delete'].name + '/modules/' + PROJECTS['delete'].modules[0].name
            + '/kanban/' + taskID).set({ 'Authorization': chiefToken }).expect(200)
        
        await module.refresh()
        assert(module.kanbanItems().length === 1, 'Error deleting task!')
        assert(module.kanbanItems()[0]._id() !== taskID, 'Deleted wrong task!')

        return Promise.resolve()
    })

/**********************************************************************************************************************
    KANBAN GET
**********************************************************************************************************************/

    it('get', async function() {
        let chiefToken = await PROJECTS['get'].chief.getToken()
        let developerToken = await DEVELOPER.getToken()
        let randomUserToken = await RANDOM_USER.getToken()

        let project = await Project.findByName(PROJECTS['get'].name)
        let module = project.modules().find(it => it.name() === PROJECTS['get'].modules[0].name)
        await module.newTask('qwerty')
        await module.newTask('asd', '')
        await module.refresh()
        let taskID = module.kanbanItems()[0]._id()

        // no token
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban').expect(500).expect('Token has not been passed!')

        // no developer
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban').set({ 'Authorization': randomUserToken }).expect(403)
        
        // no such project
        await request.get('/projects/FAKE' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban').set({ 'Authorization': developerToken }).expect(404)
        
        // no such module
        await request.get('/projects/' + PROJECTS['get'].name + '/modules/FAKE' + PROJECTS['get'].modules[0].name
            + '/kanban').set({ 'Authorization': developerToken }).expect(404)

        let res = await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban').set({ 'Authorization': developerToken }).expect(200)

        let initialTasksN = res.body.length
        assert(initialTasksN === 2, 'Wrong number of tasks returned')

        assert(res.body.some((it: { name: string }) => it.name === 'qwerty')
        && res.body.some((it: { name: string }) => it.name === 'asd'), 'A task not appear in return!')
        assert(res.body[0].taskDescription === '' || res.body[1].taskDescription === '', 'A description not match!')

        await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban').set({ 'Authorization': chiefToken }).expect(200)

        // skip first
        res = await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban/1').set({ 'Authorization': developerToken }).expect(200)
        assert(res.body.length === initialTasksN -1, 'Wrong number of tasks returned')

        // filter user
        res = await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban/0/' + DEVELOPER.email).set({ 'Authorization': developerToken }).expect(200)
        assert(res.body.length === 0, 'Wrong number of tasks returned')

        await module.updateTaskStatus(taskID, States.TODO, States.IN_PROGRESS, (await DEVELOPER.getUser())._id(),
            (await DEVELOPER.getUser())._id())

        // filter user
        res = await request.get('/projects/' + PROJECTS['get'].name + '/modules/' + PROJECTS['get'].modules[0].name
            + '/kanban/0/' + DEVELOPER.email).set({ 'Authorization': developerToken }).expect(200)
        assert(res.body.length === 1, 'Wrong number of tasks returned')

        return Promise.resolve()
    })
})