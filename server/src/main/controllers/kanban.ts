/**
 * Manage input-output request for a chat
 * 
 * @author Paolo Baldini
 */
import { Project, User, getTasks as _getTasks } from '../models'
import { KANBAN_STATES } from '../models/db'

export async function newTask(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.description) return result.status(409).send('Message body not found!')

        await module.newTask(request.body.description) // TODO parse to avoid code injection or strange things

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

        let state = null
        if (request.body.newState === KANBAN_STATES.TODO)
            state = KANBAN_STATES.TODO
        else if (request.body.newState === KANBAN_STATES.IN_PROGRESS)
            state = KANBAN_STATES.IN_PROGRESS
        else if (request.body.newState === KANBAN_STATES.DONE)
            state = KANBAN_STATES.DONE
        else return result.status(409).send('Invalid state!')

        await module.updateTaskStatus(request.params.taskID, state)

        result.status(200).send('Task succesfully created!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getTasks(request: any, result: any) {
    try {
        let skipTask = request.body.skipN ? request.body.skipN : 0
        let tasks = null

        if (request.body.user) {
            let user = await User.findByEmail(request.body.user)
            tasks = await _getTasks(request.params.projectName, request.params.moduleName, skipTask, user._id())
        } else tasks = await _getTasks(request.params.projectName, request.params.moduleName, skipTask)

        result.status(200).send(tasks)
    } catch (err) {console.log(err)
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}