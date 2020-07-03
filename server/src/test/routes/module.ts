/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from "mongoose"
import { register, Roles, User, Project, newModule, addDevelop } from "../../main/models"
import { DBUser, DBProject } from "../../main/models/db"
import { config as dbConfig } from '../../main/config/db'
import { sign } from "jsonwebtoken"
import { secret } from "../../main/config/auth"

const request = require('supertest')('http://localhost:8080')

const PROJECTS = [
    {
        chief: {
            email: 'pchief@chief.chief',
            passwd: 'pchief'
        },
        name: 'project',
        modules: [{
            name: 'module1',
            chief: {
                email: 'mchief@chief.chief',
                passwd: 'mchief'
            },
            developers: [ 'gianni' ]
        }, {
            name: 'module2',
            chief: {
                email: 'mchief@chief.chief',
                passwd: 'mchief'
            },
            developers: [ 'solimano' ]
        }]
    }, {
        chief: {
            email: 'pchief2@chief.chief',
            passwd: 'pchief'
        },
        name: 'project2',
        modules: [{
            name: 'module1',
            chief: {
                email: 'mchief2@chief.chief',
                passwd: 'mchief'
            },
            developers: [ 'antonio', 'costantino' ]
        }]
    }
]
const USER = {
    email: 'user@user.user',
    passwd: 'user'
}

describe('test modules\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all([
            // add an initial project chief
            register(PROJECTS[0].chief.email, PROJECTS[0].chief.passwd, Roles.USER),
            // add an initial project chief
            register(PROJECTS[1].chief.email, PROJECTS[1].chief.passwd, Roles.USER),
            // add an initial module chief
            register(PROJECTS[0].modules[0].chief.email, PROJECTS[0].chief.passwd, Roles.USER),
            // add an initial module chief
            register(PROJECTS[1].modules[0].chief.email, PROJECTS[0].chief.passwd, Roles.USER),
            // add an initial developer
            register(PROJECTS[0].modules[0].developers[0], 'x', Roles.USER),
            // add an initial developer
            register(PROJECTS[0].modules[1].developers[0], 'y', Roles.USER),
            // add an initial developer
            register(PROJECTS[1].modules[0].developers[0], 'z', Roles.USER),
            // add an initial developer
            register(PROJECTS[1].modules[0].developers[1], 'k', Roles.USER),
            // add an initial user
            register(USER.email, USER.passwd, Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: PROJECTS[0].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[1].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[0].modules[0].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[1].modules[0].chief.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[0].modules[0].developers[0] }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[0].modules[1].developers[0] }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[1].modules[0].developers[0] }) } catch (_) { }
        try { await DBUser.deleteOne({ email: PROJECTS[1].modules[0].developers[1] }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER.email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECTS[1].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    MODULE CREATION
**********************************************************************************************************************/

    it('test module creation', async function() {
        let chief = await User.findByEmail(PROJECTS[0].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECTS[0].name, chief: chief._id(), modules: [] }).save()

        // no token
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name)
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(201)

        // TODO: OK? -> NO ERROR TRYING TO ADD A NEW MODULE WITH EXISTING NAME

        // valid token
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[1].name)
            .set({ 'Authorization': chiefToken }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE DELETION
**********************************************************************************************************************/

    it('test module deletion', async function() {
        let chief = await User.findByEmail(PROJECTS[0].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        let moduleName = "auth"
        try { await new DBProject({ name: PROJECTS[0].name, chief: chief._id(), modules: [] }).save() } catch (_) { }
        let project = await Project.findByName(PROJECTS[0].name)
        project.newModule(moduleName, chief._id())

        // no token
        await request.delete('/projects/' + PROJECTS[0].name + '/modules/' + moduleName).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.delete('/projects/' + PROJECTS[0].name + '/modules/' + moduleName)
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.delete('/projects/FAKE' + PROJECTS[0].name + '/modules/' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(404)

        // TODO uncomment: delete not implemented.. no module
        //await request.delete('/projects/' + PROJECTS[0].name + '/modules/FAKE' + moduleName)
        //    .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.delete('/projects/' + PROJECTS[0].name + '/modules/' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE GET
**********************************************************************************************************************/

    it('get', async function() {
        let projectChief = await User.findByEmail(PROJECTS[1].chief.email)
        let projectChiefToken = sign({ id: projectChief._id() }, secret, { expiresIn: 86400 })
        let moduleChief = await User.findByEmail(PROJECTS[1].modules[0].chief.email)
        let chiefToken = sign({ id: moduleChief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(PROJECTS[1].modules[0].developers[0])
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        try {
            await new DBProject({ name: PROJECTS[1].name, chief: projectChief._id(), modules: [] }).save()
        } catch (_) {}
        await newModule(PROJECTS[1].modules[0].name, moduleChief._id(), PROJECTS[1].name)
        await addDevelop(PROJECTS[1].name, PROJECTS[1].modules[0].name, PROJECTS[1].modules[0].developers[0])
        await addDevelop(PROJECTS[1].name, PROJECTS[1].modules[0].name, PROJECTS[1].modules[0].developers[1])

        // no token
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name).expect(500)
            .expect('Token has not been passed!')

        // invalid token
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.get('/projects/FAKE' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.get('/projects/' + PROJECTS[1].name + '/modules/FAKE' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token and project chief
        let response = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': projectChiefToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[1].modules[0].name) throw 'Error retrieving module informations!'

        // valid token and module chief
        response = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[1].modules[0].name) throw 'Error retrieving module informations!'

        // valid token and non-developer user
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': userToken }).expect(403)

        // valid token and developer
        response = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': developerToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[1].modules[0].name) throw 'Error retrieving module informations!'

        if (response.body.developers.length < 1) throw 'Error retrieving module informations!'
        if (response.body.developers === PROJECTS[1].modules[0].developers) throw 'Error retrieving module informations!'

        return Promise.resolve()
    })
})