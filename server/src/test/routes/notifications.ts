/**
 * Tests notifications routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import { Roles } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'
import { connect } from 'mongoose'
import { _admin } from '../../main/config/firebase'
import { TestUser } from '../utils/TestUser'

const request = require('supertest')('http://localhost:8080')

const USER = new TestUser('user@user.user')

describe('test notifications\' operations', function () {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await USER.register(Roles.USER) // add an initial user
    })

    after(async function () { return clean() })

    const clean = async () => { await USER.delete() }

    it('basic', async function () {
        await request.put('/firebase/notification').expect(500)

        await request.put('/firebase/notification').set({ 'Authorization': 'John' }).expect(401)

        await request.put('/firebase/notification').set({ 'Authorization': await USER.getToken() }).expect(409)

        await request.put('/firebase/notification').set({ 'Authorization': await USER.getToken() })
            .send({ firebaseToken: '1234567890' }).expect(200)
    })
})