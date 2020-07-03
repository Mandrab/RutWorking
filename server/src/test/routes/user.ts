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

const ADMIN = {
    email: 'admin@admin.admin',
    password: 'admin'
}
const BLOCKED_USER = {
    email: 'blocked@blocked.blocked',
    password: 'blocked'
}
const NEW_USER = { email: 'new@new.new' }
const NEW_USER2 = {
    email: 'new2@new2.new2',
    password: 'new2'
}
const USER2DELETE = { email: 'delete@delete.delete' }

describe('test users\' operations', function() {
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
            // add an initial blocked user
            register(BLOCKED_USER.email, BLOCKED_USER.password, Roles.USER),
            // add a user to delete
            register(USER2DELETE.email, '123', Roles.USER)
        ])

        let user = await User.findByEmail(BLOCKED_USER.email)
        await user.block()
    })

    after(async function() { return clean() })

    var clean = async () => {
        try { await DBUser.deleteOne({ email: ADMIN.email }) } catch (_) {}
        try { await DBUser.deleteOne({ email: BLOCKED_USER.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: USER2DELETE.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: NEW_USER.email }) } catch (_) { }
        try { await DBUser.deleteOne({ email: NEW_USER2.email }) } catch (_) { }
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
        await request.post('/login').send({userEmail: ADMIN.email}).expect(500)

        // incorrect password
        await request.post('/login').send({ userEmail: ADMIN.email, password: ADMIN.password + '123456' }).expect(401)

        // correct password
        await request.post('/login').send({
            userEmail: ADMIN.email,
            password: ADMIN.password
        }).expect(200).expect('Content-Type', /json/).expect(/{"accessToken":".*"}/)

        // user not active
        await request.post('/login').send({
            userEmail: BLOCKED_USER.email,
            password: BLOCKED_USER.password
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
        let user = await User.findByEmail(ADMIN.email)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        await request.post('/user').expect(404)

        // no token passed
        await request.post('/user/' + ADMIN.email).expect(500)

        // no binded token
        await request.post('/user/' + ADMIN.email).set({ 'Authorization': 'john' }).expect(401)

        // token but no role
        await request.post('/user/' + ADMIN.email).set({ 'Authorization': token }).expect(400)

        // correct one
        await request.post('/user/' + NEW_USER.email).set({ 'Authorization': token }).send({ role:'user' }).expect(201)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    CHANGE PASSWORD
**********************************************************************************************************************/

    it('test change password', async function() {
        await register(NEW_USER2.email, NEW_USER2.password, Roles.USER)
        let user = await User.findByEmail(NEW_USER2.email)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        await request.put('/user').expect(404)

        // no token passed
        await request.put('/user/' + NEW_USER2.email).expect(500)

        // no binded token
        await request.put('/user/' + NEW_USER2.email).set({ 'Authorization': 'john' }).expect(401)

        // token but passwords
        await request.put('/user/' + NEW_USER2.email).set({ 'Authorization': token }).expect(400)

        // correct one
        await request.put('/user/' + NEW_USER2.email).set({ 'Authorization': token })
        .send({ oldPassword: NEW_USER2.password, newPassword: '123456' }).expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    DELETE
**********************************************************************************************************************/

    it('test register', async function() {
        let user = await User.findByEmail(ADMIN.email)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        await request.delete('/user').expect(404)

        // no token passed
        await request.delete('/user/' + USER2DELETE.email).expect(500)

        // no binded token
        await request.delete('/user/' + USER2DELETE.email).set({ 'Authorization': 'john' }).expect(401)

        // correct one
        await request.delete('/user/' + USER2DELETE.email).set({ 'Authorization': token })
        .expect(200)

        return Promise.resolve()
    })
})
