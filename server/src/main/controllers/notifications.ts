/**
 * Manage notifications related request
 * 
 * @author Paolo Baldini
 */
import { _admin } from "../config/firebase"
import { DBUser } from "../models/db"

export async function getFirebaseCustomToken(request: any, result: any) {
    try {
        if (!request.body.firebaseToken) throw { code: 500, message: 'Firebase token not passed!' }
        await DBUser.updateOne({ _id: request.userID }, { firebaseToken: request.body.firebaseToken })
        result.status(200).send('Token succesfully registered!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}