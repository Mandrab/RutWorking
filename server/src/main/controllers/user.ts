/**
 * Manage input-output request for a user
 *
 * @author Paolo Baldini
 */
import {
    login as _login,
    register as _register,
} from '../models/users'
import { sendEmail } from './communication'
import { User, Role, Roles } from '../models'

export async function login(request: any, result: any) {
    try {
        let token = await _login(request.body.userEmail, request.body.password)
        result.status(200).send({ accessToken: token }) // 24 hours
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function register(request: any, result: any) {
    try {
        if (!request.body.role) return result.status(400).send('Role missing in body!')

        let password = Math.random().toString(36).substring(2)
        await _register(request.params.userEmail, password, Roles.toRoles(request.body.role))

        sendEmail(request.params.userEmail, 'Registration', password, (_1: any,_2: any) => {})

        result.status(201).send('Succesfully created!')
        console.log('Generated password: ' + password) // TODO remove.. only to debug
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function changePassword(request: any, result: any) {
    try {
        if (!request.body.oldPassword || !request.body.newPassword)
            return result.status(400).send('Info missing in body!')

        let user = await User.findByEmail(request.params.userEmail)
        if (user.comparePassword(request.body.oldPassword)) {
            await user.changePassword(request.body.newPassword)
            result.status(200).send('Successfully updated!')
        } else result.status(401).send('Invalid password!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getUserInfo(_: any, result: any) {
    result.status(200).send('TODO')
}

export async function blockUser(request: any, result: any) {
    try {
        let user = await User.findByEmail(request.params.userEmail)
        user.block()
        result.status(200).send('User has been blocked!')
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}
