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

const ADMIN = {
    email: 'admin@admin.admin'
}
const USER = [
    {
        email: 'user@user.user'
    }, {
        email: 'user2@user.user'
    }, {
        email: 'user3@user.user'
    },
]
const PROJECT = [
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

        await Promise.all([
            // add an initial admin.. if yet exist ok!
            register('x', 'y', ADMIN.email, 'z', Roles.ADMIN),
            // add an initial user
            register('x', 'y', USER[0].email, 'z', Roles.USER),
            // add an initial user
            register('x', 'y', USER[1].email, 'z', Roles.USER),
            // add an initial user
            register('x', 'y', USER[2].email, 'z', Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: ADMIN.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER[0].email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER[1].email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER[2].email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[1].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[2].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[3].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[4].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[5].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[6].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[7].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    PROJECT CREATION
**********************************************************************************************************************/

    it('create', async function() {
        let admin = await User.findByEmail(ADMIN.email)
        let adminToken = sign({ id: admin._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER[0].email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no token passed
        await request.post('/projects/' + PROJECT[0].name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.post('/projects/' + PROJECT[0].name).set({ 'Authorization': 'john' }).expect(401)

        // valid token but admin
        await request.post('/projects/' + PROJECT[0].name).set({ 'Authorization': adminToken }).expect(403)

        // valid token
        await request.post('/projects/' + PROJECT[0].name).set({ 'Authorization': userToken }).expect(201)

        // post with description
        await request.post('/projects/' + PROJECT[4].name).set({ 'Authorization': userToken })
            .send({ description: 'qwerty' }).expect(201)

        // post with deadline
        await request.post('/projects/' + PROJECT[5].name).set({ 'Authorization': userToken })
            .send({ deadline: new Date().toString() }).expect(201)

        // post with description and deadline
        await request.post('/projects/' + PROJECT[6].name).set({ 'Authorization': userToken })
            .send({ description: 'qwerty', deadline: new Date().toString() }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT DELETION
**********************************************************************************************************************/

    it('delete', async function() {
        let admin = await User.findByEmail(ADMIN.email)
        let adminToken = sign({ id: admin._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER[0].email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })
        let user2 = await User.findByEmail(USER[1].email)
        let user2Token = sign({ id: user2._id() }, secret, { expiresIn: 86400 })
        try { await new DBProject({ name: PROJECT[1].name, chief: user._id(), modules: [] }).save() } catch (_) {}

        // no project with this name
        await request.delete('/projects/X' + PROJECT[1].name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.delete('/projects/' + PROJECT[1].name).set({ 'Authorization': 'john' }).expect(401)

        // valid token but not chief
        await request.delete('/projects/' + PROJECT[1].name).set({ 'Authorization': user2Token }).expect(403)

        // valid token and chief
        await request.delete('/projects/' + PROJECT[1].name).set({ 'Authorization': userToken }).expect(200)

        // create a project to delete
        await new DBProject({ name: PROJECT[2].name, chief: user._id(), modules: [] }).save()

        // valid token and admin
        await request.delete('/projects/' + PROJECT[2].name).set({ 'Authorization': adminToken }).expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT GET
**********************************************************************************************************************/

    it('get block', async function() {
        let chief = await User.findByEmail(USER[0].email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER[1].email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })
        let user2 = await User.findByEmail(USER[2].email)
        let user2Token = sign({ id: user2._id() }, secret, { expiresIn: 86400 })
        try { await new DBProject({ name: PROJECT[2].name, chief: chief._id(), modules: [] }).save() } catch (_) { }

        // no token
        await request.get('/projects').expect(500).expect('Token has not been passed!')

        // invalid token
        await request.get('/projects').set({ 'Authorization': 'john' }).expect(401)

        // valid token
        const ERR = 'Response does not contains project! DISCLAIMER: this test is intendeed to work on develop;\
            if the DB contains more than 100 project it could eventually fail'
        let response = await request.get('/projects').set({ 'Authorization': chiefToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECT[2].name)) throw ERR

        let previousSize = response.body.length
        try { await new DBProject({ name: PROJECT[3].name, chief: chief._id(), modules: [] }).save() } catch (_) {}

        // project addition
        response = await request.get('/projects').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECT[3].name)) throw ERR
        if (response.body.length !== previousSize +1 && response.body.length < 100) throw 'Error in return projects size!'

        // skip
        response = await request.get('/projects').set({ 'Authorization': userToken }).send({ skipN: 1 }).expect(200)
            .expect('Content-Type', /json/)
        if (!response.body.some((it: { name: string }) => it.name === PROJECT[3].name)) throw ERR
        if (response.body.length !== previousSize && response.body.length < 100) throw 'Error in return projects size!'

        // invalid mail
        await request.get('/projects').set({ 'Authorization': userToken })
            .send({ skipN: 1, user: "-1" }).expect(404)

        // valid mail but nor developer nor chief
        response = await request.get('/projects').set({ 'Authorization': userToken })
            .send({ skipN: 1, user: user.email() }).expect(200).expect('Content-Type', /json/)
        if (response.body.length !== 0) throw 'Error in return projects size!'

        // valid mail and chief
        response = await request.get('/projects').set({ 'Authorization': userToken })
            .send({ user: chief.email() }).expect(200).expect('Content-Type', /json/)
        if (response.body.length < 2) throw 'Error in return projects size!'

        let project = await Project.findByName(PROJECT[3].name)
        await project.newModule('module', user2._id())
        await project.refresh()
        project.modules().find(it => it.name() === 'module').addDevelop(user._id())

        // valid mail and developer
        response = await request.get('/projects').set({ 'Authorization': userToken })
            .send({ user: user.email() }).expect(200).expect('Content-Type', /json/)
        if (response.body.length < 1) throw 'Error in return projects size!'

        // valid mail and module chief
        response = await request.get('/projects').set({ 'Authorization': user2Token })
            .send({ user: user2.email() }).expect(200).expect('Content-Type', /json/)
        if (response.body.length < 1) throw 'Error in return projects size!'

        let nowDate = new Date()
        try { await new DBProject({
            name: PROJECT[7].name,
            description: 'qwerty',
            deadline: nowDate,
            chief: chief._id(),
            modules: []
        }).save() } catch (_) { }

        // valid mail and module chief
        response = await request.get('/projects').set({ 'Authorization': userToken }).expect(200)
            .expect('Content-Type', /json/)
        let module = response.body.find((it: { name: string }) => it.name === PROJECT[7].name)
        if (!module) throw 'Project has not been saved or returned correctly!'

        if (module.description !== 'qwerty') throw 'Description is missing or wrong in returned project!'
        if (module.deadline !== nowDate.toISOString()) throw 'Deadline is missing or wrong in returned project!'

        return Promise.resolve()
    })

    it('get single', async function() {
        let chief = await User.findByEmail(USER[0].email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER[1].email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })
        let user2 = await User.findByEmail(USER[2].email)
        let user2Token = sign({ id: user2._id() }, secret, { expiresIn: 86400 })
        try { await new DBProject({ name: PROJECT[2].name, chief: chief._id(), modules: [] }).save() } catch (_) { }

        // no token
        await request.get('/projects/' + PROJECT[2].name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.get('/projects/' + PROJECT[2].name).set({ 'Authorization': 'john' }).expect(401)

        // valid token
        let response = await request.get('/projects/' + PROJECT[2].name).set({ 'Authorization': chiefToken }).expect(200)
            .expect('Content-Type', /json/)
        if (response.body.name !== PROJECT[2].name) throw 'Response does not contains project!'

        let project = await Project.findByName(PROJECT[3].name)
        await project.newModule('module', user2._id())
        await project.refresh()

        // valid mail and developer
        response = await request.get('/projects/' + PROJECT[2].name).set({ 'Authorization': userToken })
            .expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECT[2].name) throw 'Response does not contains project!'

        return Promise.resolve()
    })
})