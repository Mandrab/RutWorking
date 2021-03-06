/**
 * Manage notifications related request
 * 
 * @author Paolo Baldini
 */
import { _admin } from "../config/firebase"
import { DBUser } from "../models/db"
import { Schema } from "mongoose"
import { User, Project } from "../models"
import { IDBNotification, Topics } from "../models/db/user"

export { Topics } from "../models/db/user"

/**
 * Register the firebase token of a user to be used to send notifications
 * 
 * @param request web query
 * @param result query result
 */
export async function setFirebaseCustomToken(request: any, result: any) {
    try {
        if (!request.body.firebaseToken) throw { code: 409, message: 'Firebase token not passed!' }
        await DBUser.updateOne({ _id: request.userID }, { firebaseToken: request.body.firebaseToken })
        result.status(200).send('Token succesfully registered!')
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Send notification about a topic
 * 
 * @param topic of the notification
 * @param projectName select the module from the specified project
 * @param moduleName select the users whose are member of the module
 * @param message to be sent
 * @param sender of the message
 */
export async function sendNotification(
    topic: Topics,
    projectName: string,
    moduleName: string,
    message: any,
    sender: Schema.Types.ObjectId
) {
    let user = await User.findById(sender)
    let project = await Project.findByName(projectName)
    let module = project.modules().find(it => it.name() === moduleName)

    let receivers = topic === Topics.TASK_COMPLETED ? [ await module.chief() ]
        : await Promise.all(module.developers())

    if (!receivers.some(it => it._id().toString() === module.chiefID().toString()))
        receivers = receivers.concat(await module.chief())
    receivers = receivers.filter(it => it._id().toString() !== sender.toString())

    let tokens = receivers.filter(dev => dev.firebaseToken()).map(dev => dev.firebaseToken())

    let notification = {
        topic: topic.valueOf(),
        projectName: projectName,
        moduleName: moduleName,
        senderEmail: user.email(),
        message: message
    }

    await DBUser.updateMany(
        { _id: { $in: receivers.map(it => it._id()) } },
        { $push: { "notifications": { $each: [notification as IDBNotification], $slice: -50 } } })

    if (tokens.length > 0) {
        await _admin.messaging().sendMulticast({
            data: notification,
            tokens: [...new Set(tokens)]
        })
    }
}