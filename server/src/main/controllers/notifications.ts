/**
 * Manage notifications related request
 * 
 * @author Paolo Baldini
 */
import { _admin } from "../config/firebase"
import { DBUser } from "../models/db"
import { Schema } from "mongoose"
import { User, Project } from "../models"

export enum Topics {
    CHAT_MESSAGE = 'chat_message',
    TASK_COMPLETED = 'task_completed'
}

export async function setFirebaseCustomToken(request: any, result: any) {
    try {
        if (!request.body.firebaseToken) throw { code: 500, message: 'Firebase token not passed!' }
        await DBUser.updateOne({ _id: request.userID }, { firebaseToken: request.body.firebaseToken })
        result.status(200).send('Token succesfully registered!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

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

    let receivers = topic === Topics.CHAT_MESSAGE
        ? await Promise.all(module.developers())
        : [ await module.chief() ]

    if (module.chiefID().toString() !in module.developers().map(it => it.toString()))
        receivers = receivers.concat(await module.chief())
    let tokens = receivers.filter(dev => dev.firebaseToken()).map(dev => dev.firebaseToken())

    if (tokens.length !== 0) {
        await _admin.messaging().sendMulticast({
            data: {
                topic: topic.valueOf(),
                project: projectName,
                module: moduleName,
                sender: user.email(),
                message: message
            },
            tokens: tokens
        })
    }
}