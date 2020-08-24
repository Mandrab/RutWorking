/**
 * Contains utilities to work on users
 * 
 * @author Paolo Baldini
 */

import { sign as jwtSign } from 'jsonwebtoken'
import { secret as authSecret } from '../../config/auth'
import { set as mongooseSet } from 'mongoose'
import { DBUser } from '../db'
import { Role, User } from '..'
import { Roles } from '../role'

mongooseSet('useFindAndModify', false)

/**
 * Log the user and get a token for him
 *
 * @param userEmail mail of the user
 * @param password of the user
 * @returns token binded to account
 */
export async function login(userEmail: string, password: string) {
    try {
        let user = await User.findByEmail(userEmail)

        let passwordIsValid = await user.comparePassword(password)
        if (!passwordIsValid) throw { code: 401, message: 'Unable to login!' }

        if (!user.isActive()) throw { code: 403, message: 'Unable to login! Account has been deactivated!' }

        return {
            accessToken: jwtSign({ id: user._id() }, authSecret, { expiresIn: 86400 }), // 24 hours
            userRole: (await user.role()).name()
        }
    } catch (err) {
        if (err.code && err.message) throw err
        throw { code: 500, message: 'Internal error!' }
    }
}

/**
 * Register a new user to the system
 *
 * @param userEmail email of the user (must not be yet in db)
 * @param password of the user
 * @param role in the system
 * @returns a result specifing operation result
 */
export async function register(name: string, surname: string, userEmail: string, password: string, role: Roles) {
    let roleSchema = await Role.findByName(role)
    if (!roleSchema) throw { code: 400, message: 'Role missing or not valid!' }

    try {
        await new DBUser({
            name: name,
            surname: surname,
            email: userEmail,
            password: password,
            role: roleSchema._id()
        }).save()
    } catch (err) { throw { code: 406, message: 'User already existent!' } }
}

export async function getUsers(skipN: number) {
    let users = await DBUser.find().limit(100).skip(skipN)
    return await Promise.all(users.map(async it => {
        return {
            email: it.email,
            name: it.name,
            surname: it.surname,
            role: await Role.findById(it.role),
            blocked: !it.active
        }
    }))
}