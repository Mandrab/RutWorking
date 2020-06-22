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

const ADMIN_EMAIL = 'admin@admin.admin'
const ADMIN_PASSWORD = 'admin'

const USER_EMAIL = 'user@user.user'
const USER_PASSWORD = 'user'

const USER2_EMAIL = 'user@user.user'
const USER2_PASSWORD = 'user'

const PROJECT_NAME = 'tcejorp'
const PROJECT2_NAME = '2tcejorp'
const PROJECT3_NAME = '3tcejorp'

before(async function () {
    // connect to db
    await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    await clean()

    try {
        await Promise.all([
            // add an initial admin.. if yet exist ok!
            register(ADMIN_EMAIL, ADMIN_PASSWORD, Roles.ADMIN),
            // add an initial user
            register(USER_EMAIL, USER_PASSWORD, Roles.USER),
            // add an initial user
            register(USER2_EMAIL, USER2_PASSWORD, Roles.USER),
        ])
    } catch (err) { if (err.code !== 406) { throw err } }

    return Promise.resolve()
})

var clean = async () => {
    await DBUser.deleteOne({ email: USER_EMAIL })
    await DBUser.deleteOne({ email: USER2_EMAIL })
    await DBProject.deleteOne({ name: PROJECT_NAME })
    await DBProject.deleteOne({ name: PROJECT2_NAME })
    await DBProject.deleteOne({ name: PROJECT3_NAME })
    return Promise.resolve()
}

/**********************************************************************************************************************
    PROJECT CREATION 
**********************************************************************************************************************/

describe('test project creation', function() {
    it('test project creation', async function() {
        let admin = await User.findByEmail(ADMIN_EMAIL)
        let adminToken = sign({ id: admin._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER_EMAIL)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no token passed
        request.post('/project/' + PROJECT_NAME).expect(500).expect('Token has not been passed!').end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // invalid token
        request.post('/project/' + PROJECT_NAME).set({ 'Authorization': 'john' }).expect(401).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // valid token but admin
        request.post('/project/' + PROJECT_NAME).set({ 'Authorization': adminToken }).expect(403).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // valid token
        request.post('/project/' + PROJECT_NAME).set({ 'Authorization': userToken }).expect(201).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        return Promise.resolve()
    })
})

/**********************************************************************************************************************
    PROJECT DELETION 
**********************************************************************************************************************/

describe('test project deletion', function() {
    it('test project deletion', async function() {
        let admin = await User.findByEmail(ADMIN_EMAIL)
        let adminToken = sign({ id: admin._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER_EMAIL)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })
        let user2 = await User.findByEmail(USER2_EMAIL)
        let user2Token = sign({ id: user2._id() }, secret, { expiresIn: 86400 })
        await new DBProject({ name: PROJECT2_NAME, chief: user._id(), modules: [] }).save()

        // no project with this name
        request.delete('/project/X'+PROJECT2_NAME).expect(500).expect('Token has not been passed!').end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // invalid token
        request.delete('/project/' + PROJECT2_NAME).set({ 'Authorization': 'john' }).expect(401).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // valid token but not chief
        request.delete('/project/' + PROJECT2_NAME).set({ 'Authorization': user2Token }).expect(403)
        .end((err: any) => { if (err) { console.log(err); return Promise.reject() } })

        // valid token and chief
        request.delete('/project/' + PROJECT2_NAME).set({ 'Authorization': userToken }).expect(200).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        await new DBProject({ name: PROJECT3_NAME, chief: user._id(), modules: [] }).save()

        // valid token and admin
        request.delete('/project/' + PROJECT3_NAME).set({ 'Authorization': adminToken }).expect(200).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        return Promise.resolve()
    })
})