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
import { User, Project } from '../models'

/**
 * Create a new project
 * 
 * @param request web query
 * @param result query result
 */
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
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Return the list of the projects eventually skipping the first N or filtering by user
 * 
 * @param request web query
 * @param result query result
 */
export async function getProjects(request: any, result: any) {
    try {
        let skipProject = request.params.skipN ? parseInt(request.params.skipN, 10) : 0
        let projects = null

        if (request.params.user) {
            let user = await User.findByEmail(request.params.user)
            projects = await _getProjects(skipProject, user._id())
        } else projects = await _getProjects(skipProject)

        result.status(200).send(projects)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Retrieve the information of a project
 * 
 * @param request web query
 * @param result query result
 */
export async function getProjectInfo(request: any, result: any) {
    try {
        result.status(200).send(await _getProjectInfo(request.params.name))
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Delete a project from the db
 * 
 * @param request web query
 * @param result query result
 */
export async function deleteProject(request: any, result: any) {
    try {
        let project = await Project.findByName(request.params.name)
        await project.delete()

        result.status(200).send('Project succesfully removed')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}