/**
 * Manage input-output request for a chat
 * 
 * @author Paolo Baldini
 */
import { Project, User, getTasks as _getTasks } from '../models'
import { States } from '../models/db'
import { sendNotification, Topics } from './notifications'

export async function newTask(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.description) return result.status(409).send('Message body not found!')
        let status = request.body.status ? States.parse(request.body.status) : null
        let user = request.body.assignee ? await User.findByEmail(request.body.assignee) : null

        await module.newTask(request.body.description, status, user) // TODO parse to avoid code injection or strange things

        result.status(201).send('Task succesfully created!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function updateStatus(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.newState) return result.status(409).send('Message body not found!')

        if (!module.kanbanItems().some(it => it._id().toString() === request.params.taskID))
            return result.status(404).send('Task not found!')

        let state = States.parse(request.body.newState)
        if (!state) throw { code: 409, message: 'Invalid state!' }

        if (request.body.assignee) {
            let user = await User.findByEmail(request.body.assignee)
            if (!module.developersIDs().concat(module.chiefID()).some(it => it.toString() === user._id().toString()))
                throw { code: 409, message: 'Invalid assignee!' }

            await module.updateTaskStatus(request.params.taskID, state, user._id())
        } else await module.updateTaskStatus(request.params.taskID, state)

        result.status(200).send('Task succesfully updated!')

        try {
            if (request.body.newState.toLocaleLowerCase() === States.DONE) {
                await sendNotification(
                    Topics.TASK_COMPLETED,
                    project.name(),
                    module.name(),
                    request.params.taskID,
                    request.userID
                )
            }
        } catch (err) { console.log(err) }
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getTasks(request: any, result: any) {
    try {
        let skipTask = request.params.skipN ? parseInt(request.params.skipN, 10) : 0
        let userEmail = request.params.user

        let tasks = null
        if (userEmail) {
            let user = await User.findByEmail(userEmail)
            tasks = await _getTasks(request.params.projectName, request.params.moduleName, skipTask, user._id())
        } else tasks = await _getTasks(request.params.projectName, request.params.moduleName, skipTask)

        result.status(200).send(tasks)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}