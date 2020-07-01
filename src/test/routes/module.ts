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
const USER = {
    email: 'user@user.user',
    passwd: 'user'
}

before(async function () {
    // connect to db
    await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    await clean()

    try {
        await Promise.all([
            // add an initial chief.. if yet exist ok!
            register(CHIEF.email, CHIEF.passwd, Roles.USER),
            // add an initial user
            register(USER.email, USER.passwd, Roles.USER)
        ])
    } catch (err) { if (err.code !== 406) { throw err } }

    return Promise.resolve()
})

var clean = async () => {
    try { await DBUser.deleteOne({ email: CHIEF.email }) } catch (_) {}
    try { await DBUser.deleteOne({ email: USER.email }) } catch (_) {}
    try { await DBProject.deleteOne({ name: CHIEF.project.name }) } catch (_) {}
    return Promise.resolve()
}

/**********************************************************************************************************************
    MODULE CREATION 
**********************************************************************************************************************/

describe('test module creation', function() {
    it('test module creation', async function() {
        let chief = await User.findByEmail(CHIEF.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: CHIEF.project.name, chief: chief._id(), modules: [] }).save()

        // no token
        request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0]).expect(500)
            .expect('Token has not been passed!').end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // user token (not chief)
        request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0])
            .set({ 'Authorization': userToken }).expect(403).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // no project
        request.post('/projects/FAKE' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0])
            .set({ 'Authorization': chiefToken }).expect(404).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // valid token
        request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[0])
            .set({ 'Authorization': chiefToken }).expect(201).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // TODO: OK? -> NO ERROR TRYING TO ADD A NEW MODULE WITH EXISTING NAME

        // valid token
        request.post('/projects/' + CHIEF.project.name + '/modules/' + CHIEF.project.modules[1])
            .set({ 'Authorization': chiefToken }).expect(201).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        return Promise.resolve()
    })
})