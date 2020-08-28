/**
 * Manage input-output request for a chat
 * 
 * @author Paolo Baldini
 */
import { _admin } from '../config/firebase'
import { Project, getMessages as _getMessages } from '../models'
import { sendNotification, Topics } from './notifications'

/**
 * Manage the input of a new message
 * 
 * @param request web query
 * @param result query result
 */
export async function newMessage(request: any, result: any) {
    try {
        let user = request.userID
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.message) return result.status(409).send('Message body not found!')

        await module.newMessage(user, request.body.message)

        result.status(201).send('Message succesfully created!')

        try {
            await sendNotification(
                Topics.CHAT_MESSAGE,
                project.name(),
                module.name(),
                request.body.message,
                request.userID
            )
        } catch (err) { console.log(err) }
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Respond with 100 messages
 * 
 * @param request web query
 * @param result query result
 */
export async function getMessages(request: any, result: any) {
    try {
        let skipMessage = request.params.skipN ? parseInt(request.params.skipN, 10) : 0

        let messages = await _getMessages(request.params.projectName, request.params.moduleName, skipMessage)

        result.status(200).send(messages)
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}