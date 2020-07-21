/**
 * Manage input-output request for a module
 * 
 * @author Paolo Baldini
 */
import {
    newModule as _newModule,
    addDeveloper as _addDeveloper,
    removeDeveloper as _removeDeveloper,
    getModuleInfo as _getModuleInfo,
    Project,
    User
} from '../models'

export async function newModule(request: any, result: any) {
    try {
        let user = request.userID

        let project = await Project.findByName(request.params.projectName)
        if (!project) return result.status(404).send('Parent project not found!')

        if (user.toString() !== project.chiefID().toString()) return result.status(403).send('Unauthorized!')

        await _newModule(
            request.params.moduleName,
            request.body.chief ? (await User.findByEmail(request.body.chief))._id() : user,
            project.name(),
            request.body.description,
            request.body.deadline
        )

        result.status(201).send('Project succesfully created!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function addDeveloper(request: any, result: any) {
    try {
        let projectName = request.params.projectName
        let moduleName = request.params.moduleName
        let userEmail = request.params.userEmail

        await _addDeveloper(projectName, moduleName, userEmail)
        result.status(200).send('Succesfully added!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function removeDeveloper(request: any, result: any) {
    try {
        let projectName = request.params.projectName
        let moduleName = request.params.moduleName
        let userEmail = request.params.developerEmail

        await _removeDeveloper(projectName, moduleName, userEmail)
        result.status(200).send('Developer succesfully removed')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getModuleInfo(request: any, result: any) {
    try {
        let projectName = request.params.projectName
        let moduleName = request.params.moduleName

        let module = await _getModuleInfo(projectName, moduleName)
        result.status(200).send(module)
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function deleteModule(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.projectName)
        let module = project.modules().find(it => it.name() === request.params.moduleName)
        if (!module) return result.status(404).send('Module not found')

        await module.delete()
        result.status(200).send('Module succesfully removed')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}