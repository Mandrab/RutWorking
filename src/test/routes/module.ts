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
            // add an initial chief.. if yet exist ok!
            register(CHIEF.email, CHIEF.passwd, Roles.USER),
            // add an initial user
            register(USER.email, USER.passwd, Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: CHIEF.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER.email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: CHIEF.project.name }) } catch (_) { }
    }

/**********************************************************************************************************************
    MODULE CREATION
**********************************************************************************************************************/

    it('test module creation', async function() {
        let chief = await User.findByEmail(CHIEF.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: CHIEF.project.name, chief: chief._id(), modules: [] }).save()

        // no token
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0]).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0])
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0])
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0])
            .set({ 'Authorization': chiefToken }).expect(201)

        // TODO: OK? -> NO ERROR TRYING TO ADD A NEW MODULE WITH EXISTING NAME

        // valid token
        await request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[1])
            .set({ 'Authorization': chiefToken }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE DELETION
**********************************************************************************************************************/

    it('test module deletion', async function() {
        let chief = await User.findByEmail(CHIEF.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        let moduleName = "auth"
        try { await new DBProject({ name: CHIEF.project.name, chief: chief._id(), modules: [] }).save() } catch (_) { }
        let project = await Project.findByName(CHIEF.project.name)
        project.newModule(moduleName, chief._id())

        // no token
        await request.delete('/projects/' + CHIEF.project.name + '/modules/' + moduleName).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.delete('/projects/' + CHIEF.project.name + '/modules/' + moduleName)
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.delete('/projects/FAKE' + CHIEF.project.name + '/modules/' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(404)

        // TODO uncomment: delete not implemented.. no module
        //await request.delete('/projects/' + CHIEF.project.name + '/modules/FAKE' + moduleName)
        //    .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.delete('/projects/' + CHIEF.project.name + '/modules/' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(200)

        return Promise.resolve()
    })
})