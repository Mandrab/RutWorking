/**
 * Manage input-output request for a project
 * 
 * @author Paolo Baldini
 */

import { newProject as _newProject } from '../models/projects'

export async function newProject(request: any, result: any) {
    _newProject(request.params.name, request.userID).then(() => {
        result.status(201).send('Project succesfully created!')
    }).catch((err: any) => {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    })
}

export async function getProjectInfo(request: any, result: any) { /* TODO */ }

export async function blockProject(request: any, result: any) { /* TODO */ }