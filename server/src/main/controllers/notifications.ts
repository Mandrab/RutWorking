/**
 * Manage notifications related request
 * 
 * @author Paolo Baldini
 */
import { User } from "../models"
import { _admin } from "../config/firebase"

export async function getFirebaseCustomToken(request: any, result: any) {
    try {
        let user = await User.findById(request.userID)

        let customToken = await _admin.auth().createCustomToken(user.email())

        result.status(200).send({ firebaseCustomToken: customToken })
        // PING PONG
        /*
        const notification_options = {
            priority: "high",
            timeToLive: 60 * 60 * 24        // time the message takes to expire
        }
        const token = request.body.token
        const message = request.body.payload
        const options = request.body.options

        await _admin.messaging().sendToDevice(token, message, options)*/
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}