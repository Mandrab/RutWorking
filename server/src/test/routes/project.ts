/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from "mongoose"
import { Roles, Project } from "../../main/models"
import { DBProject } from "../../main/models/db"
import { config as dbConfig } from '../../main/config/db'
import { TestUser } from "./utils/testUser"

const request = require('supertest')('http://localhost:8080')

const ADMIN = new TestUser('admin@admin.admin')
const USERS: TestUser[] = [
    new TestUser('user@user.user'),
    new TestUser('user2@user.user'),
    new TestUser('user3@user.user')
]
const PROJECTS = [
    { name: 'tcejorp' },
    { name: '2tcejorp' },
    { name: '3tcejorp' },
    { name: '4tcejorp' },
    { name: '5tcejorp' },
    { name: '6tcejorp' },
    { name: '7tcejorp' },
    { name: '8tcejorp' }
]

describe('test projects\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        // add initial users
        await Promise.all(USERS.map(async user => user.register(Roles.USER)).concat(
            // add an initial admin
            ADMIN.register(Roles.ADMIN)
        ))
    })

    after(async function() { return clean() })

    var clean = async () => {
        // delete initial users
        await Promise.all(USERS.map(async user => user.delete()).concat(
            // delete an initial admin
            ADMIN.delete()
        ))
        try { await DBProject.deleteOne({ name: PROJECTS[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[1].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[2].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[3].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[4].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[5].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[6].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[7].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    PROJECT CREATION
**********************************************************************************************************************/

    it('create', async function() {
        let adminToken = await ADMIN.getToken()
        let userToken = await USERS[0].getToken()

        // no token passed
        await request.post('/projects/project/' + PROJECTS[0].name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.post('/projects/project/' + PROJECTS[0].name).set({ 'Authorization': 'john' }).expect(401)

        // valid token but admin
        await request.post('/projects/project/' + PROJECTS[0].name).set({ 'Authorization': adminToken }).expect(403)

        // valid token
        await request.post('/projects/project/' + PROJECTS[0].name).set({ 'Authorization': userToken }).expect(201)

        // post with description
        await request.post('/projects/project/' + PROJECTS[4].name).set({ 'Authorization': userToken })
            .send({ description: 'qwerty' }).expect(201)

        // post with deadline
        await request.post('/projects/project/' + PROJECTS[5].name).set({ 'Authorization': userToken })
            .send({ deadline: new Date().toString() }).expect(201)

        // post with description and deadline
        await request.post('/projects/project/' + PROJECTS[6].name).set({ 'Authorization': userToken })
            .send({ description: 'qwerty', deadline: new Date().toString() }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT DELETION
**********************************************************************************************************************/

    it('delete', async function() {
        let adminToken = await ADMIN.getToken()
        let user = await USERS[0].getUser()
        let userToken = await USERS[0].getToken()
        let user2Token = await USERS[1].getToken()
        try { await new DBProject({ name: PROJECTS[1].name, chief: user._id(), modules: [] }).save() } catch (_) {}

        // no token passed
        await request.delete('/projects/project/' + PROJECTS[1].name).expect(500)
            .expect('Token has not been passed!')

        // invalid token
        await request.delete('/projects/project/' + PROJECTS[1].name).set({ 'Authorization': 'john' })
            .expect(401)

        // valid token but not chief
        await request.delete('/projects/project/' + PROJECTS[1].name).set({ 'Authorization': user2Token })
            .expect(403)

        // no project with this name (user cannot be chief of undefined)
        await request.delete('/projects/project/X' + PROJECTS[1].name).set({ 'Authorization': userToken })
            .expect(404)

        // valid token and chief
        await request.delete('/projects/project/' + PROJECTS[1].name).set({ 'Authorization': userToken })
            .expect(200)

        // create a project to delete
        await new DBProject({ name: PROJECTS[2].name, chief: user._id(), modules: [] }).save()

        // valid token but admin
        await request.delete('/projects/project/' + PROJECTS[2].name).set({ 'Authorization': adminToken })
            .expect(403)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT GET
**********************************************************************************************************************/

    it('get block', async function() {
        let chief = await USERS[0].getUser()
        let chiefToken = await USERS[0].getToken()
        let user = await USERS[1].getUser()
        let userToken = await USERS[1].getToken()
        let user2 = await USERS[2].getUser()
        let user2Token = await USERS[2].getToken()
        try { await new DBProject({ name: PROJECTS[2].name, chief: chief._id(), modules: [] }).save() } catch (_) { }

        // no token
        await request.get('/projects').expect(500).expect('Token has not been passed!')

        // invalid token
        await request.get('/projects').set({ 'Authorization': 'john' }).expect(401)

        // valid token
        const ERR = 'Response does not contains project! DISCLAIMER: this test is intendeed to work on develop;\
            if the DB contains more than 100 project it could eventually fail'
        let response = await request.get('/projects').set({ 'Authorization': chiefToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECTS[2].name)) throw ERR

        let previousSize = response.body.length
        try { await new DBProject({ name: PROJECTS[3].name, chief: chief._id(), modules: [] }).save() } catch (_) {}

        // project addition
        response = await request.get('/projects').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECTS[3].name)) throw ERR
        if (response.body.length !== previousSize +1 && response.body.length < 100) throw 'Error in return projects size!'

        // skip
        response = await request.get('/projects/1').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECTS[3].name)) throw ERR
        if (response.body.length !== previousSize && response.body.length < 100) throw 'Error in return projects size!'

        // invalid mail
        await request.get('/projects/1/-1').set({ 'Authorization': userToken }).expect(404)

        // valid mail but nor developer nor chief
        response = await request.get('/projects/1/' + user.email()).set({ 'Authorization': userToken })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.length !== 0) throw 'Error in return projects size!'

        // valid mail and chief
        response = await request.get('/projects/0/' + chief.email()).set({ 'Authorization': userToken })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.length < 2) throw 'Error in return projects size!'

        let project = await Project.findByName(PROJECTS[3].name)
        await project.newModule('module', user2._id())
        await project.refresh()
        project.modules().find(it => it.name() === 'module').addDeveloper(user._id())

        // valid mail and developer
        response = await request.get('/projects/0/' + user.email()).set({ 'Authorization': userToken })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.length < 1) throw 'Error in return projects size!'

        // valid mail and module chief
        response = await request.get('/projects/0/' + user2.email()).set({ 'Authorization': user2Token })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.length < 1) throw 'Error in return projects size!'

        let nowDate = new Date()
        try { await new DBProject({
            name: PROJECTS[7].name,
            description: 'qwerty',
            deadline: nowDate,
            chief: chief._id(),
            modules: []
        }).save() } catch (_) { }

        // valid mail and module chief
        response = await request.get('/projects').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        let module = response.body.find((it: { name: string }) => it.name === PROJECTS[7].name)
        if (!module) throw 'Project has not been saved or returned correctly!'

        if (module.description !== 'qwerty') throw 'Description is missing or wrong in returned project!'
        if (module.deadline !== nowDate.toISOString()) throw 'Deadline is missing or wrong in returned project!'

        return Promise.resolve()
    })

    it('get single', async function() {
        let chief = await USERS[0].getUser()
        let user2 = await USERS[2].getUser()
        let chiefToken = await USERS[0].getToken()
        let userToken = await USERS[1].getToken()

        try { await new DBProject({ name: PROJECTS[2].name, chief: chief._id(), modules: [] }).save() } catch (_) { }

        // no token
        await request.get('/projects/project/' + PROJECTS[2].name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.get('/projects/project/' + PROJECTS[2].name).set({ 'Authorization': 'john' }).expect(401)

        // valid token
        let response = await request.get('/projects/project/' + PROJECTS[2].name).set({ 'Authorization': chiefToken })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[2].name) throw 'Response does not contains project!'

        let project = await Project.findByName(PROJECTS[3].name)
        await project.newModule('module', user2._id())
        await project.refresh()

        // valid mail and developer
        response = await request.get('/projects/project/' + PROJECTS[2].name).set({ 'Authorization': userToken })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[2].name) throw 'Response does not contains project!'

        return Promise.resolve()
    })
})