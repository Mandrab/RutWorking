/**
 * Manage input-output request for a user
 * 
 * @author Paolo Baldini
 */
import {
    User, Roles,
    login as _login,
    register as _register,
    getUsers as _getUsers,
    getUserNotification as _getUserNotification,
    getUserNotificationCount as _getUserNotificationCount
} from '../models'
import { sendEmail } from './mailer'

/**
 * Allow a user to log into the system
 * 
 * @param request web query
 * @param result query result
 */
export async function login(request: any, result: any) {
    try {
        let res = await _login(request.body.userEmail, request.body.password)
        result.status(200).send(res) // 24 hours
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Allow an admin to register a user
 * 
 * @param request web query
 * @param result query result
 */
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

        sendEmail(request.params.userEmail, 'Registration',
            'Your generated password is: ' + password + ' Change it as soon as possible!')
            .catch((err: any) => { if (err) console.log(err) })

        result.status(201).send('Succesfully created!')
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Allow a user to change his own password
 * 
 * @param request web query
 * @param result query result
 */
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
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Allow a user to get his own notifications
 * 
 * @param request web query
 * @param result query result
 */
export async function getUserNotifications(request: any, result: any) {
    try {
        let notifications = await _getUserNotification(request.userID)
        result.status(200).send(notifications)
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Allow a user to get the number of his unseen notifications
 * 
 * @param request web query
 * @param result query result
 */
export async function getUserNotificationsCount(request: any, result: any) {
    try {
        let notifications = await _getUserNotificationCount(request.userID)
        result.status(200).send({ unseenNotifications: notifications })
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Returns informations about a user
 * 
 * @param request web query
 * @param result query result
 */
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
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Return a list of 100 users, eventually skipping the first N
 * 
 * @param request web query
 * @param result query result
 */
export async function getUsers(request: any, result: any) {
    try {
        let skipUsers = request.params.skipN ? parseInt(request.params.skipN, 10) : 0

        let users = await _getUsers(skipUsers)

        result.status(200).send(users)
    } catch (err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Delete a user. Really, only block it for history purpose
 * 
 * @param request web query
 * @param result query result
 */
export async function blockUser(request: any, result: any) {
    try {
        let user = await User.findByEmail(request.params.userEmail)
        user.block()
        result.status(200).send('User has been blocked!')

        sendEmail(request.params.userEmail, 'Block of account',
            'Your account has been blocked. You will no longer be able to log into your account.')
            .catch((err: any) => { if (err) console.log(err) })
    } catch(err) {
        if (err.code && err.code < 1000 && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}