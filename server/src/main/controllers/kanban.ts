/**
 * Manage input-output request for a chat
 * 
 * @author Paolo Baldini
 */
import { Project, User, getTasks as _getTasks } from '../models'
import { States } from '../models/db'
import { sendNotification, Topics } from './notifications'

/**
 * Insert a new task in a module
 * 
 * @param request web query
 * @param result query result
 */
export async function newTask(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.name) return result.status(409).send('Task name not found!')
        let status = request.body.status ? States.parse(request.body.status) : null
        let assignee = request.body.assignee ? await User.findByEmail(request.body.assignee) : null
        if (assignee && !module.developersIDs().concat(module.chiefID())
            .some(it => it.toString() === assignee._id().toString()))
                return result.status(404).send('The specified user is not a developer of the module')

        if (module.kanbanItems().some(it => it.name() === request.body.name))
            return result.status(409).send('A task with this name already exists')

        await module.newTask(request.body.name, request.body.description, status, assignee)

        result.status(201).send('Task succesfully created!')
    } catch(err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Update status (to-do/in-progress/...; assignee) of a task
 * 
 * @param request web query
 * @param result query result
 */
export async function updateStatus(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.newState) return result.status(409).send('Message body not found!')

        let tasks = module.kanbanItems().filter(it => it._id().toString() === request.params.taskID)
        if (tasks.length === 0) return result.status(404).send('Task not found!')

        let state = States.parse(request.body.newState)
        if (!state) throw { code: 409, message: 'Invalid state!' }

        if (request.body.assignee) {
            let user = await User.findByEmail(request.body.assignee)
            if (!module.developersIDs().concat(module.chiefID()).some(it => it.toString() === user._id().toString()))
                throw { code: 409, message: 'Invalid assignee!' }

            await module.updateTaskStatus(request.params.taskID, States.parse(tasks[0].status()), state,
                tasks[0].assigneeID(), user._id())
        } else await module.updateTaskStatus(request.params.taskID, States.parse(tasks[0].status()), state,
            tasks[0].assigneeID())

        result.status(200).send('Task succesfully updated!')

        try {
            if (state === States.DONE) {
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
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Delete a task
 * 
 * @param request web query
 * @param result query result
 */
export async function deleteTask(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        await module.deleteTask(request.params.taskID)

        result.status(200).send('Task succesfully deleted!')
    } catch(err) {console.log(err)
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Get list of tasks. It's possible to skip N first task
 * 
 * @param request web query
 * @param result query result
 */
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
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}