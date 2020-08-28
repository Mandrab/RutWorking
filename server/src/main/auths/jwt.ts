/**
 * Utilities functions to validate and identify user through json-web-token
 *
 * @author Paolo Baldini
 */
import { User, Roles, Project } from "../models"
import { Schema } from "mongoose"

/**
 * Infer user id from token or respond with an error in case it does not exist
 * 
 * @param request web query
 * @param result query response
 * @param next callback
 * @returns {Schema.Types.ObjectId} user id if exists
 */
export async function token2id(request: any, result: any, next?: Function): Promise<Schema.Types.ObjectId> {
    try {
        request.userID = await _token2id(request)

        if (next) next()
        return request.userID
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Invalid token')
    }
}

/**
 * Infer user id from token or throw an error in case it does not exist
 * 
 * @param request web query
 * @returns {Schema.Types.ObjectId} user id if exists
 */
export async function _token2id(request: any): Promise<Schema.Types.ObjectId> {
    let user = await User.findByToken(request.headers['authorization'])

    return user._id()
}

/**
 * Check if a user account is blocked
 * 
 * @param request web query
 * @param result query response
 * @param next callback
 * @returns {boolean} true if it's active, false otherwise
 */
export async function isActive(request: any, result: any, next?: Function): Promise<boolean> {
    try {
        request.userID = await _token2id(request)

        let isActive = (await User.findById(request.userID)).isActive()

        if (!isActive) {
            result.status(403).send('This account is blocked')
            return false
        }
        
        if (next) next()
        return true
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * A currying function to check if the user is associated to a specific role
 * 
 * @param role to check membership
 * @param request web query
 * @param result query response
 * @param next callback
 */
export const isRole = (role: Roles | string) => async (request: any, result: any, next?: Function) => {
    try {
        await _isRole(role)(request)

        if (next) next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * A currying function to check if the user is associated to a specific role. If it succeed, the user has the role
 * 
 * @param role to check membership
 * @param request web query
 * @returns true if the user has the specified role, otherwise the function will throw an error
 */
export const _isRole = (role: Roles | string) => async (request: any) => {
    request.userID = await _token2id(request)

    let user = await User.findById(request.userID)
    let userRole = await user.role()

    if (userRole.name() !== role.toString()) throw { code: 403, message: 'Unauthorized'}

    return true
}

/**
 * A currying function to check if the user is a module or project chief
 * 
 * @param entity 'project' or 'module'
 * @param request web query
 * @param result query response
 * @param next callback
 */
export const isChief = (entity: string) => async (request: any, result: any, next?: Function) => {
    try {
        await _isChief(entity)(request)

        if (next) next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * A currying function to check if the user is a module or project chief. If it succeed, the user is chief
 * 
 * @param entity 'project' or 'module'
 * @param request web query
 * @returns true if the user is chief, otherwise the function will throw an error
 */
export const _isChief = (entity: string) => async (request: any) => {
    request.userID = await _token2id(request)

    let projectName = request.params.projectName ? request.params.projectName : request.params.name
    if (!projectName) throw { code: 404, message: 'Project non specified' }

    let user = await User.findById(request.userID)
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

    return true
}

/**
 * Check if a user is developer in a specified module
 * 
 * @param request web query
 * @param result query response
 * @param next callback
 */
export async function isDeveloper(request: any, result: any, next?: Function) {
    try {
        _isDeveloper(request)

        if (next) next()
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Check if a user is developer in a specified module
 * 
 * @param request web query
 * @returns true if the user is developer, otherwise the function will throw an error
 */
export async function _isDeveloper(request: any) {
    request.userID = await _token2id(request)

    let projectName = request.params.projectName
    if (!projectName) throw { code: 404, message: 'Project non specified' }

    let moduleName = request.params.moduleName
    if (!moduleName) throw { code: 404, message: 'Module non specified' }

    let user = await User.findById(request.userID)
    let project = await Project.findByName(projectName)

    let module = project.modules().find(it => it.name() === moduleName)
    if (!module) throw { code: 404, message: 'Module not found!' }
    let developersPromises = module.developers()
    let developers = await Promise.all(developersPromises)

    let isDeveloper = developers.some(it => it._id().toString() === user._id().toString())

    if (!isDeveloper) throw { code: 403, message: 'Unauthorized' }

    return true
}

/**
 * Allow to check if at least one of the conditions is satisfied
 * 
 * @param conditions to check
 */
export const or = (...conditions: ((request: any) => Promise<boolean>)[]) =>
async (request: any, result: any, next: Function) => {
    let res: any = null

    for (var c of conditions) {
        try {
            res = await c(request)
            break
        } catch (err) { res = err }
    }
    if (res !== true) {
        if (res && res.code && res.message) result.status(res.code).send(res.message)
        else result.status(500).send('No condition satisfied')
    } else if (next) next()
}