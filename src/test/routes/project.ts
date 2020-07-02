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

const ADMIN = {
    email: 'admin@admin.admin',
    password: 'admin'
}
const USER = [
    {
        email: 'user@user.user',
        password: 'user'
    }, {
        email: 'user2@user.user',
        password: 'user2'
    }
]
const PROJECT = [
    { name: 'tcejorp' },
    { name: '2tcejorp' },
    { name: '3tcejorp' }
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
            register(ADMIN.email, ADMIN.password, Roles.ADMIN),
            // add an initial user
            register(USER[0].email, USER[0].password, Roles.USER),
            // add an initial user
            register(USER[1].email, USER[1].password, Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: ADMIN.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER[0].email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER[1].email }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[0].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[1].name }) } catch (_) { }
        try { await DBProject.deleteOne({ name: PROJECT[2].name }) } catch (_) { }
    }

/**********************************************************************************************************************
    PROJECT CREATION 
**********************************************************************************************************************/

    it('test project creation', async function() {
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

        return Promise.resolve()
    })

/**********************************************************************************************************************
    PROJECT DELETION 
**********************************************************************************************************************/

    it('test project deletion', async function() {
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
})