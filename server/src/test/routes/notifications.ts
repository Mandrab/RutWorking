import { User, register, Roles } from "../../main/models"
import { secret } from "../../main/config/auth"
import { config as dbConfig } from "../../main/config/db"
import { connect } from "mongoose"
import { DBUser } from "../../main/models/db"
import { sign } from "jsonwebtoken"
import { _admin } from "../../main/config/firebase"
import { firebaseApp } from "../../test-config/firebase"

require('../../test-config/firebase')

const request = require('supertest')('http://localhost:8080')

const USER: any = {
    email: 'user@user.user'
}

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
        await request.get('/firebase/notification').expect(500)

        await request.get('/firebase/notification').set({ 'Authorization': 'John' }).expect(401)

        let result = await request.get('/firebase/notification').set({ 'Authorization': USER.token })
            .expect(200).expect('Content-Type', /json/)
        let token = result.body.firebaseCustomToken
        if (!token) throw 'No token returned!'

        let credential = await firebaseApp.auth().signInWithCustomToken(token)

        /*var payload = {
            notification: {
                title: "This is a Notification",
                body: "This is the body of the notification message."
            }
        }

        var options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        }

        console.log(firebaseApp.messaging)

        _admin.messaging()/*.onMessage((payload) => {
            console.log(payload)
        })*

        await request.get('/firebase/notification').send({
            token: customToken,
            payload: payload,
            options: options
        }).expect(200)
        /*firebase.auth().signOut().then(function () {
            // Sign-out successful.
        }).catch(function (error) {
            // An error happened.
        })*/

        return Promise.resolve()
    })
})