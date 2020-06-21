/**
 * Contains utilities to work on users
 * 
 * @author Paolo Baldini
 */

import { sign as jwtSign } from 'jsonwebtoken'
import { secret as authSecret } from '../config/auth'
import { set as mongooseSet } from 'mongoose'
import { DBUser } from './db/user'
import { Result } from './result'
import { Role, User } from '.'

mongooseSet('useFindAndModify', false)

/**
 * Log the user and get a token for him
 *
 * @param userEmail mail of the user
 * @param password of the user
 * @returns token binded to account
 */
export function login(userEmail: string, password: string): Promise<string> {
    return new Promise(async (resolve: Function, reject: Function) => {
        try {
            let user = await User.findByEmail(userEmail)
            if (!user) return reject({ code: 404, message: 'Unable to login!' })

            let passwordIsValid = await user.comparePassword(password)
            if (!passwordIsValid) return reject({ code: 401, message: 'Unable to login!' })

            if (!user.isActive()) return reject({ code: 403, message: 'Unable to login! Account has been deactivated!' })

            resolve(jwtSign({ id: user._id() },authSecret, { expiresIn: 86400 })) // 24 hours
        } catch (err) {
            if (err.code && err.message) reject(err)
            else reject({ code: 500, message: 'Internal error!' })
        }
    })
}

/**
 * Register a new user to the system
 *
 * @param userEmail email of the user (must not be yet in db)
 * @param password of the user
 * @param role in the system
 * @returns a result specifing operation result
 */
export function register(userEmail: string, password: string, role: string): Promise<Result> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let roleSchema = await Role.findByName(role)
        if (!roleSchema) return reject({ code: 400, message: 'Role missing or not valid!' })

        new DBUser({ email: userEmail, password: password, role: roleSchema._id }).save((err, _) => {
            if (err) return reject({ code: 404, message: 'User already existent!' })

            resolve({ code: 201, message: 'Successfully registered!' })
        })
    })
}