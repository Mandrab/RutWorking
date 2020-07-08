/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from "mongoose"
import { register, Roles, User, Project } from "../../main/models"
import { DBUser, DBProject, KANBAN_STATES } from "../../main/models/db"
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
            email: 'chief@chief.chief'
        }
    }, {
        name: 'project2',
        modules: [
            'module1',
            'module2'
        ],
        chief: {
            email: 'chief@chief.chief'
        }
    }, {
        name: 'project3',
        modules: [
            'module1',
            'module2'
        ],
        chief: {
            email: 'chief@chief.chief'
        }
    }
]
const DEVELOPER = {
    email: 'developer@developer.developer'
}
const RANDOM_USER = {
    email: 'user@user.user'
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
            register('x', 'y', PROJECT[0].chief.email, 'z', Roles.USER),
            // add an initial developer
            register('x', 'y', DEVELOPER.email, 'z', Roles.USER),
            // add an initial user
            register('x', 'y', RANDOM_USER.email, 'z', Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: PROJECT[0].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: DEVELOPER.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: RANDOM_USER.email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[1].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[2].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    KANBAN POST
**********************************************************************************************************************/

    it('post', async function() {
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

    it('update', async function() {
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
        
        // no assignee specified
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).send({ newState: 'IN-PROGRESS' }).expect(400)
        
        // TO-DO does not need an assignee
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).send({ newState: 'TO-DO' }).expect(200)
        
        // invalid assignee
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).send({ newState: 'IN-PROGRESS', assignee: randomUser.email() })
            .expect(409)

        // valid token chief
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task1ID)
            .set({ 'Authorization': chiefToken }).send({ newState: 'IN-PROGRESS', assignee: developer.email() })
            .expect(200)

        // valid token developer
        await request.put('/projects/' + PROJECT[1].name + '/modules/' + PROJECT[1].modules[0] + '/kanban/' + task2ID)
            .set({ 'Authorization': developerToken }).send({ newState: 'DONE', assignee: developer.email() })
            .expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    KANBAN GET
**********************************************************************************************************************/

    it('get', async function() {
        let chief = await User.findByEmail(PROJECT[2].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(DEVELOPER.email)
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let randomUser = await User.findByEmail(RANDOM_USER.email)
        let randomUserToken = sign({ id: randomUser._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECT[2].name, chief: chief._id(), modules: [{
            name: PROJECT[2].modules[0],
            chief: chief._id(),
            developers: [ developer._id() ],
            chatMessages: [],
            kanbanItems: []
        }] }).save()
        let project = await Project.findByName(PROJECT[2].name)
        let module = project.modules().find(it => it.name() === PROJECT[2].modules[0])
        await module.newTask('qwerty')
        await module.newTask('asd')
        await project.refresh()
        await module.refresh()
        let task1ID = module.kanbanItems()[0]._id()

        // no token
        await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .expect(500).expect('Token has not been passed!')

        // no developer
        await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': randomUserToken }).expect(403)
        
        // no such project
        await request.get('/projects/FAKE' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).expect(404)
        
        // no such module
        await request.get('/projects/' + PROJECT[2].name + '/modules/FAKE' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).expect(404)

        let res = await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).expect(200)

        let initialTasksN = res.body.length
        if (initialTasksN < 2) throw 'Wrong number of tasks returned'
        if (!res.body.some((it: { taskDescription: string }) => it.taskDescription === 'qwerty'))
            throw 'A task not appear in return!'
        if (!res.body.some((it: { taskDescription: string }) => it.taskDescription === 'asd'))
            throw 'A task not appear in return!'
        
        await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': chiefToken }).expect(200)

        // skip first
        res = await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).send({ skipN: 1 }).expect(200)
        if (res.body.length !== initialTasksN -1) throw 'Wrong number of tasks returned'

        // filter user
        res = await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).send({ user: developer.email() }).expect(200)
        if (res.body.length !== 0) throw 'Wrong number of tasks returned'

        await module.updateTaskStatus(task1ID, KANBAN_STATES.IN_PROGRESS, developer._id())

        // filter user
        res = await request.get('/projects/' + PROJECT[2].name + '/modules/' + PROJECT[2].modules[0] + '/kanban')
            .set({ 'Authorization': developerToken }).send({ user: developer.email() }).expect(200)
        if (res.body.length !== 1) throw 'Wrong number of tasks returned'

        return Promise.resolve()
    })
})