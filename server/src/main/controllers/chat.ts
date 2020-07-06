/**
 * Manage input-output request for a chat
 * 
 * @author Paolo Baldini
 */
import { Project, getMessages as _getMessages, User } from '../models'
import { _admin } from '../config/firebase'

export async function newMessage(request: any, result: any) {
    try {
        let user = request.userID
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.message) return result.status(409).send('Message body not found!')

        await module.newMessage(user, request.body.message) // TODO parse to avoid code injection or strange things

        result.status(201).send('Message succesfully created!')

        module.refresh()
        let userObj = await User.findById(request.userID)
        let developers = await Promise.all(module.developers())
        if (module.chiefID().toString() !in module.developers().map(it => it.toString()))
            developers = developers.concat(await module.chief())
        let tokens = developers.filter(dev => dev.firebaseToken()).map(dev => dev.firebaseToken())
        try {
            let message = {
                data: {
                    sender: userObj.email(),
                    message: request.body.message
                },
                tokens: tokens
            }
            await _admin.messaging().sendMulticast(message)
        } catch (err) { console.log(err) }
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getMessages(request: any, result: any) {
    try {
        let skipMessage = request.body.skipN ? request.body.skipN : 0
        
        let messages = await _getMessages(request.params.projectName, request.params.moduleName, skipMessage)

        result.status(200).send(messages)
    } catch (err) {console.log(err)
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}