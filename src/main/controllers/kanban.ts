/**
 * Manage input-output request for a chat
 * 
 * @author Paolo Baldini
 */
import { Project } from '../models'

export async function newTask(request: any, result: any) {
    try {
        let user = request.userID
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found!')

        if (!request.body.description) return result.status(409).send('Message body not found!')

        await module.newTask(request.body.description, project._id()) // TODO parse to avoid code injection or strange things

        result.status(201).send('Task succesfully created!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function updateStatus(request: any, result: any) { /* TODO */ }

export async function getTasks(request: any, result: any) { /* TODO */ }