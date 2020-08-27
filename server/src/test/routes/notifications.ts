/**
 * Tests notifications routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import { User, register, Roles } from '../../main/models'
import { secret } from '../../main/config/auth'
import { config as dbConfig } from '../../main/config/db'
import { connect } from 'mongoose'
import { DBUser } from '../../main/models/db'
import { sign } from 'jsonwebtoken'
import { _admin } from '../../main/config/firebase'

const request = require('supertest')('http://localhost:8080')

const USER: any = { email: 'user@user.user' }

describe('test notifications\' operations', function () {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        // add an initial user
        await _sign(USER, Roles.USER)
    })

    after(async function () { return clean() })

    const _sign = async (user: any, role: Roles) => {
        await register('x', 'y', user.email, 'z', role)
        user.obj = await User.findByEmail(user.email)
        user.token = sign({ id: user.obj._id() }, secret, { expiresIn: 86400 })
    }

    const clean = async () => {
        try { await DBUser.deleteOne({ email: USER.email }) } catch (_) { }
    }

    it('basic', async function () {
        await request.put('/firebase/notification').expect(500)

        await request.put('/firebase/notification').set({ 'Authorization': 'John' }).expect(401)

        await request.put('/firebase/notification').set({ 'Authorization': USER.token }).expect(409)

        await request.put('/firebase/notification').set({ 'Authorization': USER.token })
            .send({ firebaseToken: '1234567890' }).expect(200)

        return Promise.resolve()
    })
})