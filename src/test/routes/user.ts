/**
 * Tests user routes
 * 
 * @author Paolo Baldini
 */
import { before, it } from 'mocha'
import { connect } from 'mongoose'
import { Roles, register, User } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'
import { DBUser } from '../../main/models/db'
import { sign } from 'jsonwebtoken'
import { secret } from '../../main/config/auth'

const request = require('supertest')('http://localhost:8080')

const ADMIN_EMAIL = 'admin@admin.admin'
const ADMIN_PASSWORD = 'admin'

const BLOCKED_USER_EMAIL = 'blocked@blocked.blocked'
const BLOCKED_USER_PASSWORD = 'blocked'

const NEW_USER_EMAIL = 'new@new.new'

const NEW_USER2_EMAIL = 'new2@new2.new2'
const NEW_USER2_PASSWORD = 'new2'

const USER2DELETE_EMAIL = 'delete@delete.delete'

describe('test users\' operations', function() {
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
                // add an initial blocked user
                register(BLOCKED_USER_EMAIL, BLOCKED_USER_PASSWORD, Roles.USER),
                // add a user to delete
                register(USER2DELETE_EMAIL, '123', Roles.USER)
            ])
        } catch (err) { if (err.code !== 406) { throw err } }

        let user = await User.findByEmail(BLOCKED_USER_EMAIL)
        await user.block()

        return Promise.resolve()
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: BLOCKED_USER_EMAIL }) } catch (_) {}
        try { await DBUser.deleteOne({ email: NEW_USER_EMAIL }) } catch (_) {}
        try { await DBUser.deleteOne({ email: NEW_USER2_EMAIL }) } catch (_) {}
        return Promise.resolve()
    }

/**********************************************************************************************************************
    LOGIN 
**********************************************************************************************************************/

    it('test login', async function() {

        // no email specified
        await request.post('/login').expect(404)

        // user not found
        await request.post('/login').send({ userEmail: 'john' }).expect(404)

        // password missing
        await request.post('/login').send({userEmail: ADMIN_EMAIL}).expect(500)

        // incorrect password
        await request.post('/login').send({ userEmail: ADMIN_EMAIL, password: ADMIN_PASSWORD + '123456' }).expect(401)

        // correct password
        await request.post('/login').send({
            userEmail: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        }).expect(200).expect('Content-Type', /json/).expect(/{"accessToken":".*"}/)

        // user not active
        await request.post('/login').send({
            userEmail: BLOCKED_USER_EMAIL,
            password: BLOCKED_USER_PASSWORD
        }).expect(403)

        // not valid ops
        await request.put('/login').expect(404)
        await request.get('/login').expect(404)
        await request.delete('/login').expect(404)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    REGISTER 
**********************************************************************************************************************/

    it('test register', async function() {
        let user = await User.findByEmail(ADMIN_EMAIL)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        await request.post('/user').expect(404)

        // no token passed
        await request.post('/user/' + ADMIN_EMAIL).expect(500)

        // no binded token
        await request.post('/user/' + ADMIN_EMAIL).set({ 'Authorization': 'john' }).expect(401)

        // token but no role
        await request.post('/user/' + ADMIN_EMAIL).set({ 'Authorization': token }).expect(400)

        // correct one
        await request.post('/user/' + NEW_USER_EMAIL).set({ 'Authorization': token }).send({ role:'user' }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    CHANGE PASSWORD 
**********************************************************************************************************************/

    it('test change password', async function() {
        await register(NEW_USER2_EMAIL, NEW_USER2_PASSWORD, Roles.USER)
        let user = await User.findByEmail(NEW_USER2_EMAIL)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        await request.put('/user').expect(404)

        // no token passed
        await request.put('/user/' + NEW_USER2_EMAIL).expect(500)

        // no binded token
        await request.put('/user/' + NEW_USER2_EMAIL).set({ 'Authorization': 'john' }).expect(401)

        // token but passwords
        await request.put('/user/' + NEW_USER2_EMAIL).set({ 'Authorization': token }).expect(400)

        // correct one
        await request.put('/user/' + NEW_USER2_EMAIL).set({ 'Authorization': token })
        .send({ oldPassword: NEW_USER2_PASSWORD, newPassword: '123456' }).expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    DELETE 
**********************************************************************************************************************/

    it('test register', async function() {
        let user = await User.findByEmail(ADMIN_EMAIL)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        await request.delete('/user').expect(404)

        // no token passed
        await request.delete('/user/' + USER2DELETE_EMAIL).expect(500)

        // no binded token
        await request.delete('/user/' + USER2DELETE_EMAIL).set({ 'Authorization': 'john' }).expect(401)

        // correct one
        await request.delete('/user/' + USER2DELETE_EMAIL).set({ 'Authorization': token })
        .expect(200)

        return Promise.resolve()
    })
})