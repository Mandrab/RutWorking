/**
 * Manage input-output request for a module
 * 
 * @author Paolo Baldini
 */

import { newModule as _newModule, Project } from '../models'

export async function newModule(request: any, result: any) {
    try {

        let user = request.userID

        let project = await Project.findByName(request.params.projectName)
        if (!project) return result.status(404).send('Parent project not found!')

        if (user.toString() !== project.chiefID().toString()) return result.status(403).send('Unauthorized!')

        if (!request.chief) await _newModule(request.params.moduleName, user, project.name())
        else await _newModule(request.params.moduleName, request.chief, project.name())

        result.status(201).send('Project succesfully created!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getModuleInfo(request: any, result: any) { /* TODO */ }

export async function endModule(request: any, result: any) { /* TODO */ }