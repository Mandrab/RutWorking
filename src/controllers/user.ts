/**
 * Manage input-output request for a user
 * 
 * @author Paolo Baldini
 */

import {
    login as _login,
    register as _register,
    blockUser as _blockUser,
    changePassword as _changePassword
} from '../models/utils/users'
import { sendEmail } from './communication'

export async function login(request: any, result: any) {
    _login(request.body.userEmail, request.body.password).then((token: any) =>{
        result.status(200).send({ accessToken: token }) // 24 hours
    }).catch((err: any) => {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    })
}

export async function register(request: any, result: any) {
    try {
        if (!request.body.role) return result.status(400).send('Role missing in body!')

        let password = Math.random().toString(36).substring(2)
        let res = await _register(request.params.userEmail, password, request.body.role)

        sendEmail(request.params.userEmail, 'Registration', password, (_1: any,_2: any) => {})
        result.status(res.code).send(res.message)
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

        let succeded = await _changePassword(
            request.params.userEmail,
            request.body.oldPassword,
            request.body.newPassword
        )
        if (!succeded) return result.status(401).send('Invalid password!')
        result.status(200).send('Successfully updated!')
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

export async function getUserInfo(_: any, result: any) {
    result.status(200).send('TODO')
}

export async function blockUser(request: any, result: any) {
    _blockUser(request.params.userEmail).then(() => {
        result.status(200).send('User has been blocked!')
    }).catch((err: any) => {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    })
}