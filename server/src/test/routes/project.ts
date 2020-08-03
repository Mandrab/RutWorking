/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from 'mongoose'
import { Roles, Project } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'
import { TestUser } from './utils/TestUser'
import { TestProjectBuilders } from './utils/TestProject'
import { TestClass } from './utils/TestClass'
import { DBProject } from '../../main/models/db'

const request = require('supertest')('http://localhost:8080')

const ADMIN = new TestUser('admin@admin.admin')
const USER = new TestUser(`user@user.user`)
const USER2 = new TestUser(`user2@user.user`)
const NEW_PROJECT = TestProjectBuilders.new('newproject', 'newprojectchief@mail.mail').build()
const PROJECTS = TestClass.associativeArray(
    ['delete', 'get multiple', 'get single'],
    idx => TestProjectBuilders.new(`project${idx}`, `p${idx}chief@user.user`).build()
)

describe('test projects\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all(Object.values(PROJECTS).map(it => it.registerAll()))

        await NEW_PROJECT.chief.register(Roles.USER)
        await ADMIN.register(Roles.ADMIN)           // add an initial admin
        await USER.register(Roles.USER)             // add initial user
        await USER2.register(Roles.USER)             // add initial user
    })

    after(async function() { return clean() })

    var clean = async () => {
        await NEW_PROJECT.deleteAll()
        await Promise.all(Object.values(PROJECTS).map(it => it.deleteAll()))

        await ADMIN.delete()                        // delete an initial admin
        await USER.delete()                         // delete initial user
        await USER2.delete()                         // delete initial user
    }

/**********************************************************************************************************************
    PROJECT CREATION
**********************************************************************************************************************/

    it('create', async function() {
        let adminToken = await ADMIN.getToken()
        let newChiefToken = await NEW_PROJECT.chief.getToken()

        // no token passed
        await request.post('/projects/project/' + NEW_PROJECT.name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.post('/projects/project/' + NEW_PROJECT.name).set({ 'Authorization': 'john' }).expect(401)

        // valid token but admin
        await request.post('/projects/project/' + NEW_PROJECT.name).set({ 'Authorization': adminToken }).expect(403)

        // valid token
        await request.post('/projects/project/' + NEW_PROJECT.name).set({ 'Authorization': newChiefToken }).expect(201)

        // post with description
        await NEW_PROJECT.delete()
        await request.post('/projects/project/' + NEW_PROJECT.name).set({ 'Authorization': newChiefToken })
            .send({ description: 'qwerty' }).expect(201)

        // post with deadline
        await NEW_PROJECT.delete()
        newChiefToken = await USER.getToken()
        await request.post('/projects/project/' + NEW_PROJECT.name).set({ 'Authorization': newChiefToken })
            .send({ deadline: new Date().toString() }).expect(201)

        // post with description and deadline
        await NEW_PROJECT.delete()
        await request.post('/projects/project/' + NEW_PROJECT.name).set({ 'Authorization': newChiefToken })
            .send({ description: 'qwerty', deadline: new Date().toString() }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT DELETION
**********************************************************************************************************************/

    it('delete', async function() {
        let adminToken = await ADMIN.getToken()
        let chiefToken = await PROJECTS['delete'].chief.getToken()
        let userToken = await USER.getToken()

        // no token passed
        await request.delete('/projects/project/' + PROJECTS['delete'].name).expect(500)
            .expect('Token has not been passed!')

        // invalid token
        await request.delete('/projects/project/' + PROJECTS['delete'].name).set({ 'Authorization': 'john' })
            .expect(401)

        // valid token but admin
        await request.delete('/projects/project/' + PROJECTS['delete'].name).set({ 'Authorization': adminToken })
            .expect(403)

        // valid token but not chief
        await request.delete('/projects/project/' + PROJECTS['delete'].name).set({ 'Authorization': userToken })
            .expect(403)

        // no project with this name (user cannot be chief of undefined)
        await request.delete('/projects/project/X' + PROJECTS['delete'].name).set({ 'Authorization': chiefToken })
            .expect(404)

        // valid token and chief
        await request.delete('/projects/project/' + PROJECTS['delete'].name).set({ 'Authorization': chiefToken })
            .expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT GET
**********************************************************************************************************************/

    it('get multiple', async function() {
        let chief = await PROJECTS['get multiple'].chief.getUser()
        let chiefToken = await PROJECTS['get multiple'].chief.getToken()
        let user = await USER.getUser()
        let userToken = await USER.getToken()
        let user2 = await USER2.getUser()
        let user2Token = await USER2.getToken()

        // no token
        await request.get('/projects').expect(500).expect('Token has not been passed!')

        // invalid token
        await request.get('/projects').set({ 'Authorization': 'john' }).expect(401)

        // valid token
        const ERR = 'Response does not contains project! DISCLAIMER: this test is intendeed to work on develop;\
            if the DB contains more than 100 project it could fail'
        let response = await request.get('/projects').set({ 'Authorization': chiefToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECTS['get multiple'].name)) throw ERR

        let previousSize = response.body.length
        PROJECTS['get multiple 2'] = TestProjectBuilders.new(
            PROJECTS['get multiple'].name + ' 2', PROJECTS['get multiple'].chief
        ).build()
        await PROJECTS['get multiple 2'].register()

        // project addition
        response = await request.get('/projects').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECTS['get multiple 2'].name)) throw ERR
        if (response.body.length !== previousSize +1 && response.body.length < 100)
            throw 'Error in return projects size!'

        // skip
        response = await request.get('/projects/1').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECTS['get multiple 2'].name)) throw ERR
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

        let project = await Project.findByName(PROJECTS['get multiple'].name)
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
        PROJECTS['get multiple 3'] = TestProjectBuilders.new(
            PROJECTS['get multiple'].name + ' 3', PROJECTS['get multiple'].chief
        ).build()
        try { await new DBProject({
            name: PROJECTS['get multiple 3'].name,
            description: 'qwerty',
            deadline: nowDate,
            chief: chief._id(),
            modules: []
        }).save() } catch (_) { }

        // valid mail and module chief
        response = await request.get('/projects').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        let module = response.body.find((it: { name: string }) => it.name === PROJECTS['get multiple 3'].name)
        if (!module) throw 'Project has not been saved or returned correctly!'

        if (module.description !== 'qwerty') throw 'Description is missing or wrong in returned project!'
        if (module.deadline !== nowDate.toISOString()) throw 'Deadline is missing or wrong in returned project!'

        return Promise.resolve()
    })

    it('get single', async function() {
        let chiefToken = await PROJECTS['get single'].chief.getToken()
        let userToken = await USER.getToken()

        // no token
        await request.get('/projects/project/' + PROJECTS['get single'].name).expect(500)
            .expect('Token has not been passed!')

        // invalid token
        await request.get('/projects/project/' + PROJECTS['get single'].name).set({ 'Authorization': 'john' })
            .expect(401)

        // valid token
        let response = await request.get('/projects/project/' + PROJECTS['get single'].name)
            .set({ 'Authorization': chiefToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS['get single'].name) throw 'Response does not contains project!'

        // valid mail and user
        response = await request.get('/projects/project/' + PROJECTS['get single'].name)
            .set({ 'Authorization': userToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS['get single'].name) throw 'Response does not contains project!'

        return Promise.resolve()
    })
})