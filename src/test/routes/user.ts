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

var clean = async () => {
    await DBUser.deleteOne({ email: BLOCKED_USER_EMAIL }),
    await DBUser.deleteOne({ email: NEW_USER_EMAIL })
    await DBUser.deleteOne({ email: NEW_USER2_EMAIL })
    return Promise.resolve()
}

/**********************************************************************************************************************
    LOGIN 
**********************************************************************************************************************/

describe('test login', function() {
    it('test login', function(done) {

        // no email specified
        request.post('/login').expect(404).end((err: any) => { if (err) { console.log(err); done(err) } })

        // user not found
        request.post('/login').send({userEmail: 'john'}).expect(404).end((err: any) => { if (err) { console.log(err); done(err) } })

        // password missing
        request.post('/login').send({userEmail: ADMIN_EMAIL}).expect(500)
            .end((err: any) => { if (err) { console.log(err); done(err) } })

        // incorrect password
        request.post('/login').send({
            userEmail: ADMIN_EMAIL,
            password: ADMIN_PASSWORD + '123456'
        }).expect(401).end((err: any) => { if (err) { console.log(err); done(err) } })

        // correct password
        request.post('/login').send({
            userEmail: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        }).expect(200).expect('Content-Type', /json/).expect(/{"accessToken":".*"}/)
            .end((err: any) => { if (err) { console.log(err); done(err) } })

        // user not active
        request.post('/login').send({
            userEmail: BLOCKED_USER_EMAIL,
            password: BLOCKED_USER_PASSWORD
        }).expect(403).end((err: any) => { if (err) { console.log(err); done(err) } })

        // not valid ops
        request.put('/login').expect(404).end((err: any) => { if (err) { console.log(err); done(err) } })
        request.get('/login').expect(404).end((err: any) => { if (err) { console.log(err); done(err) } })
        request.delete('/login').expect(404).end((err: any) => { if (err) { console.log(err); done(err) } })

        done()
    })
})

/**********************************************************************************************************************
    REGISTER 
**********************************************************************************************************************/

describe('test register', function() {
    it('test register', async function() {
        let user = await User.findByEmail(ADMIN_EMAIL)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        request.post('/user').expect(404).end((err: any) => { if (err) {
            console.log(err); return Promise.reject() }
        })

        // no token passed
        request.post('/user/' + ADMIN_EMAIL).expect(500).end((err: any) => { if (err) {
            console.log(err); return Promise.reject() }
        })

        // no binded token
        request.post('/user/' + ADMIN_EMAIL).set({ 'Authorization': 'john' }).expect(401).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // token but no role
        request.post('/user/' + ADMIN_EMAIL).set({ 'Authorization': token }).expect(400).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // correct one
        request.post('/user/' + NEW_USER_EMAIL).set({ 'Authorization': token }).send({ role: 'user' })
        .expect(201).end((err: any) => { if (err) { console.log(err); return Promise.reject() } })

        return Promise.resolve()
    })
})

/**********************************************************************************************************************
    CHANGE PASSWORD 
**********************************************************************************************************************/

describe('test change password', function() {
    it('test change password', async function() {
        await register(NEW_USER2_EMAIL, NEW_USER2_PASSWORD, Roles.USER)
        let user = await User.findByEmail(NEW_USER2_EMAIL)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        request.put('/user').expect(404).end((err: any) => { if (err) {
            console.log(err); return Promise.reject() }
        })

        // no token passed
        request.put('/user/' + NEW_USER2_EMAIL).expect(500).end((err: any) => { if (err) {
            console.log(err); return Promise.reject() }
        })

        // no binded token
        request.put('/user/' + NEW_USER2_EMAIL).set({ 'Authorization': 'john' }).expect(401).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // token but passwords
        request.put('/user/' + NEW_USER2_EMAIL).set({ 'Authorization': token }).expect(400).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // correct one
        request.put('/user/' + NEW_USER2_EMAIL).set({ 'Authorization': token })
        .send({ oldPassword: NEW_USER2_PASSWORD, newPassword: '123456' })
        .expect(200).end((err: any) => { if (err) { console.log(err); return Promise.reject() } })

        return Promise.resolve()
    })
})

/**********************************************************************************************************************
    DELETE 
**********************************************************************************************************************/

describe('test register', function() {
    it('test register', async function() {
        let user = await User.findByEmail(ADMIN_EMAIL)
        let token = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        // no email specified
        request.delete('/user').expect(404).end((err: any) => { if (err) {
            console.log(err); return Promise.reject() }
        })

        // no token passed
        request.delete('/user/' + USER2DELETE_EMAIL).expect(500).end((err: any) => { if (err) {
            console.log(err); return Promise.reject() }
        })

        // no binded token
        request.delete('/user/' + USER2DELETE_EMAIL).set({ 'Authorization': 'john' }).expect(401).end((err: any) => {
            if (err) { console.log(err); return Promise.reject() }
        })

        // correct one
        request.delete('/user/' + USER2DELETE_EMAIL).set({ 'Authorization': token })
        .expect(200).end((err: any) => { if (err) { console.log(err); return Promise.reject() } })

        return Promise.resolve()
    })
})