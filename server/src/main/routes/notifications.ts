/**
 * Routes of RESTful API regarding notifications
 * 
 * @author Paolo Baldini
 */
import { isRole } from '../auths/jwt'
import { _admin } from '../config/firebase'
import { Roles } from '../models'

const isUser = isRole(Roles.USER)

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24        // time the message takes to expire
}

module.exports = function (app: any) {
    app.get('/firebase/notification', /*[isUser],*/ async function (request: any, result: any) {
        try {
            // PING PONG
            const token = request.body.token
            const message = request.body.payload
            const options = request.body.options

            await _admin.messaging().sendToDevice(token, message, options)

            result.status(200).send("Notification sent successfully")
        } catch (err) {
            if (err.code && err.message) result.status(err.code).send(err.message)
            else result.status(500).send('Internal error')
        }
    })
}