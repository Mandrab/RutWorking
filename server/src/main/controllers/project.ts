/**
 * Manage input-output request for a project
 * 
 * @author Paolo Baldini
 */
import {
    newProject as _newProject,
    getProjects as _getProjects,
    getProjectInfo as _getProjectInfo
} from '../models/utils/projects'
import { User } from '../models'

export async function newProject(request: any, result: any) {
    try {
        await _newProject(
            request.params.name,
            request.userID,
            request.body.description,
            request.body.deadline ? new Date(request.body.deadline) : null
        )
        result.status(201).send('Project succesfully created!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getProjects(request: any, result: any) {
    try {
        let skipProject = request.body.skipN ? request.body.skipN : 0
        let projects = null

        if (request.body.user) {
            let user = await User.findByEmail(request.body.user)
            projects = await _getProjects(skipProject, user._id())
        } else projects = await _getProjects(skipProject)

        result.status(200).send(projects)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getProjectInfo(request: any, result: any) {
    try {
        result.status(200).send(await _getProjectInfo(request.params.name))
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function blockProject(request: any, result: any) { result.status(200).send('TODO')/* TODO */ }