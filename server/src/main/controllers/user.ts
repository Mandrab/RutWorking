/**
 * Manage input-output request for a user
 * 
 * @author Paolo Baldini
 */
import {
    User, Roles,
    login as _login,
    register as _register,
    getUsers as _getUsers
} from '../models'
import { sendEmail } from './communication'

export async function login(request: any, result: any) {
    try {
        let res = await _login(request.body.userEmail, request.body.password)
        result.status(200).send(res) // 24 hours
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function register(request: any, result: any) {
    try {
        if (!request.body.role) return result.status(400).send('Role missing in body!')
        if (!request.body.name) return result.status(400).send('Name missing in body!')
        if (!request.body.surname) return result.status(400).send('Surname missing in body!')

        let password = Math.random().toString(36).substring(2)
        await _register(
            request.body.name,
            request.body.surname,
            request.params.userEmail,
            password,
            Roles.toRoles(request.body.role)
        )

        sendEmail(request.params.userEmail, 'Registration', password, (_1: any,_2: any) => {})

        result.status(201).send('Succesfully created!')
        //console.log('Generated password: ' + password) // TODO remove.. only to debug
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
        if (await user.comparePassword(request.body.oldPassword)) {
            await user.changePassword(request.body.newPassword)
            result.status(200).send('Successfully updated!')
        } else result.status(401).send('Invalid password!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getUserInfo(request: any, result: any) {
    try {
        let user = await User.findByEmail(request.params.userEmail)

        result.status(200).send({
            name: user.name(),
            surname: user.surname(),
            email: user.email(),
            role: (await user.role()).name(),
            blocked: !user.isActive()
        })
    } catch(err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getUsers(request: any, result: any) {
    try {
        let skipUsers = request.params.skipN ? parseInt(request.params.skipN, 10) : 0

        let users = await _getUsers(skipUsers)

        result.status(200).send(users)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
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