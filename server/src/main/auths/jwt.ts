/**
 * Utilities functions to validate and identify user through json-web-token
 *
 * @author Paolo Baldini
 */
import { User, Roles, Project } from "../models"
import { Schema } from "mongoose"

// respont to the request
export async function token2id(request: any, result: any, next?: Function) {
    try {
        await _token2id(request, result)

        if (next) next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function _token2id(request: any, _: any) {
    let user = await User.findByToken(request.headers['authorization'])

    request.userID = user._id()
    return user._id()
}

export async function isActive(request: any, result: any, next?: Function) {
    try {
        let userID = await _token2id(request, result)

        let isActive = (await User.findById(userID)).isActive()

        if (!isActive) {
            result.status(403).send('This account is blocked')
            return false
        } else if (next) next()

        return true
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export function isRole(role: Roles | string) {
    return async function (request: any, result: any, next?: Function) {
        try {
            await _isRole(role)(request, result, next)
        } catch (err) {
            if (err.code && err.message) result.status(err.code).send(err.message)
            else result.status(500).send('Internal error')
        }
    }
}

export function _isRole(role: Roles | string) {
    return async function (request: any, result: any, next?: Function) {
        let userID = await _token2id(request, result)

        let user = await User.findById(userID)
        let userRole = await user.role()

        if (userRole.name() !== role.toString()) throw { code: 403, message: 'Unauthorized'}

        if (next) next()
        return true
    }
}

export function isChief(entity: string) {
    return async function (request: any, result: any, next?: Function) {
        try {
            await _isChief(entity)(request, result, next)
        } catch (err) {
            if (err.code && err.message) result.status(err.code).send(err.message)
            else result.status(500).send('Internal error')
        }
    }
}

export function _isChief(entity: string) {
    return async function (request: any, result: any, next?: Function) {
        let userID = await _token2id(request, result)

        let projectName = request.params.projectName ? request.params.projectName : request.params.name
        if (!projectName) throw { code: 404, message: 'Project non specified' }

        let user = await User.findById(userID)
        let project = await Project.findByName(projectName)

        let _entity: { chiefID(): Schema.Types.ObjectId } = null

        if (entity === 'project')
            _entity = project
        else if (entity === 'module') {
            _entity = project.modules().find(it => it.name() === request.params.moduleName)
            if (!_entity) throw { code: 404, message: 'Module not found!' }
        } else throw { code: 500, message: 'Internal error' }

        let isChief = _entity.chiefID().toString() === user._id().toString()

        if (!isChief) throw { code: 403, message: 'Unauthorized' }
    
        if (next) next()
        return true
    }
}

export async function isDeveloper(request: any, result: any, next?: Function) {
    try {
        _isDeveloper(request, result, next)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function _isDeveloper(request: any, result: any, next?: Function) {
    let userID = await _token2id(request, result)

    let projectName = request.params.projectName
    if (!projectName) throw { code: 404, message: 'Project non specified' }

    let moduleName = request.params.moduleName
    if (!moduleName) throw { code: 404, message: 'Module non specified' }

    let user = await User.findById(userID)
    let project = await Project.findByName(projectName)

    let module = project.modules().find(it => it.name() === moduleName)
    if (!module) throw { code: 404, message: 'Module not found!' }
    let developersPromises = module.developers()
    let developers = await Promise.all(developersPromises)

    let isDeveloper = developers.some(it => it._id().toString() === user._id().toString())

    if (!isDeveloper) throw { code: 403, message: 'Unauthorized' }

    if (next) next()
    return true
}

export function or(...conditions: ((request: any, result: any, next?: Function) => Promise<boolean>)[]) {
    return async function (request: any, result: any, next: Function) {
        let res: any = null

        for (var c of conditions) {
            try {
                res = await c(request, result)
                break
            } catch (err) { res = err }
        }
        if (res !== true) {
            if (res && res.code && res.message) result.status(res.code).send(res.message)
            else result.status(500).send('No condition satisfied')
        } else if (next) next()
    }
}