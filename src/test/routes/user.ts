/**
 * Tests user routes
 * 
 * @author Paolo Baldini
 */
import { before, it } from 'mocha'
import { connect } from 'mongoose'
import { Roles, register, User } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'

const request = require('supertest')('http://localhost:8080')

const ADMIN_EMAIL = 'admin@admin.admin'
const ADMIN_PASSWORD = 'admin'

const BLOCKED_USER_EMAIL = 'blocked@blocked.blocked'
const BLOCKED_USER_PASSWORD = 'blocked'

before(async function () {
    // connect to db
    await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    try {
        await Promise.all([
            // add an initial admin.. if yet exist ok!
            register(ADMIN_EMAIL, ADMIN_PASSWORD, Roles.ADMIN),
            // add an initial admin.. if yet exist ok!
            register(BLOCKED_USER_EMAIL, BLOCKED_USER_PASSWORD, Roles.USER)
        ])
    } catch (err) { if (err.code !== 406) { throw err } }

    let user = await User.findByEmail(BLOCKED_USER_EMAIL)
    await user.block()

    return Promise.resolve()
})

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