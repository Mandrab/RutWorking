/**
 * Manage input-output request for a project
 * 
 * @author Paolo Baldini
 */
import { newProject as _newProject, getProjects as _getProjects } from '../models/projects'

export async function newProject(request: any, result: any) {
    try {
        await _newProject(request.params.name, request.userID)
        
        result.status(201).send('Project succesfully created!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getProjects(request: any, result: any) {
    try {
        let skipProject = request.body.skipN ? request.body.skipN : 0
        let projects = await _getProjects(skipProject)

        result.status(200).send(projects)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getProjectInfo(request: any, result: any) { /* TODO */ }

export async function blockProject(request: any, result: any) { result.status(200).send('TODO')/* TODO */ }