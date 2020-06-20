/**
 * Utilities functions to validate and identify user through json-web-token
 *
 * @author Paolo Baldini
 */

import { User } from '../models/user'
import {
    validate as _validate,
    isActive as _isActive,
    isUser as _isUser,
    isAdmin as _isAdmin
} from '../models/utils/users'
import { Project } from '../models/project'

export async function validate(request: any, result: any, next?: Function): Promise<void> {
    return new Promise(async (resolve: Function, _: Function) => {
        try {
            let bToken = request.headers['authorization']
            var token = bToken.split(' ')[1] // Bearer TOKEN

            let userID = await _validate(token)
            
            request.userID = userID

            if (next) next()
            else resolve()
        } catch (err) {
            if (err.code && err.message) result.status(err.code).send(err.message)
            else result.status(500).send('Internal error')
        }
    })
}

export async function isActive(request: any, result: any, next: Function) {
    try {
        await validate(request, result)

        let isActive = await _isActive(request.userID)

        if (!isActive) result.status(403).send('This account is blocked')
        else next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function isUser(request: any, result: any, next: Function) {
    try {
        await validate(request, result)

        let isUser = await _isUser(request.userID, request.params.userEmail)

        if (!isUser) result.status(403).send('Unauthorized')
        else next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function isAdmin(request: any, result: any, next: Function) {
    try {
        await validate(request, result)

        let isAdmin = await _isAdmin(request.userID)

        if (!isAdmin) result.status(403).send('Unauthorized')
        else next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function isUserOrAdmin(request: any, result: any, next: Function) {
    try {
        await validate(request, result)

        let user = await User.findById(request.userID)
        if (!user) return result.status(404).send('User not found!')

        if (request.params.userEmail === user.email) return next()

        let isAdmin = await _isAdmin(user._id)

        if (!isAdmin) result.status(403).send('Unauthorized')
        else next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function isChiefOrAdmin(request: any, result: any, next: Function) {
    try {
        await validate(request, result)
        
        let user = await User.findById(request.userID)
        if (!user) return result.status(404).send('User not found!')

        let project = await Project.findOne({ name: request.params.name })
        if (!project) return result.status(404).send('Project not found!')

        if (project.chief === user._id) return result.status(403).send('Unauthorized')

        throw new Error("TODO");
        //TODO
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}