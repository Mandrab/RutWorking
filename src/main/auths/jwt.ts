/**
 * Utilities functions to validate and identify user through json-web-token
 *
 * @author Paolo Baldini
 */
import { User, Roles, Project } from "../models"

export async function validate(request: any, result: any, next?: Function): Promise<void> {
    return new Promise(async (resolve: Function, _: Function) => {
        try {
            let user = (await User.findByToken(request.headers['authorization']))

            request.userID = user._id()

            resolve()
            if (next) next()
        } catch (err) {
            if (err.code && err.message) result.status(err.code).send(err.message)
            else result.status(500).send('Internal error')
        }
    })
}

export async function isActive(request: any, result: any, next: Function) {
    try {
        await validate(request, result)

        let isActive = (await User.findById(request.userID)).isActive()

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

        let isUser = (await (await User.findById(request.userID)).role()).name() === Roles.USER.toString()

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

        let isAdmin = (await (await User.findById(request.userID)).role()).name() === Roles.ADMIN.toString()

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

        if (request.params.userEmail === user.email()) return next()
        let isAdmin = (await user.role()).name() === Roles.ADMIN.toString()

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
        let userRole = await user.role()

        let project = await Project.findByName(request.params.name)

        if (project.chiefID().toString() === user._id().toString() || userRole.name() === Roles.ADMIN) next()
        else result.status(403).send('Unauthorized')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}