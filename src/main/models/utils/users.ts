/**
 * Contains utilities to work on users
 * 
 * @author Paolo Baldini
 */

import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken'
import { genSalt, hash, compare } from "bcrypt"
import { secret as authSecret } from '../../config/auth'
import { set as mongooseSet } from 'mongoose'
import { User, SALT_WORK_FACTOR } from '../user'
import { Role } from '../role'
import { Result } from '../result'
import { ObjectId } from 'mongodb'

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
            let user = await User.findOne({ email: userEmail })
            if (!user) return reject({ code: 404, message: 'Unable to login!' })

            let passwordIsValid = await compare(password, user.password)
            if (!passwordIsValid) return reject({ code: 401, message: 'Unable to login!' })

            if (!user.active) return reject({ code: 403, message: 'Unable to login! Account has been deactivated!' })

            resolve(jwtSign({ id: user.id },authSecret, { expiresIn: 86400 })) // 24 hours
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
        let roleSchema = await Role.findOne({ name: role })
        if (!roleSchema) return reject({ code: 400, message: 'Role missing or not valid!' })

        new User({ email: userEmail, password: password, role: roleSchema._id }).save((err, _) => {
            if (err) return reject({ code: 404, message: 'User already existent!' })

            resolve({ code: 201, message: 'Successfully registered!' })
        })
    })
}

/**
 * Change password of an user
 * 
 * @param userEmail email address of the user to which change password
 * @param oldPassword a password can only be changed if the previous one is known
 * @param newPassword the new password to set
 * @returns true if succesfully changed password
 */
export function changePassword(userEmail: string, oldPassword: string, newPassword: string): Promise<boolean> {
    return new Promise(async (resolve: Function, _: Function) => {
        let user = await User.findOne({ email: userEmail })

        let matching = await compare(oldPassword, user.password)
        if (!matching) return resolve(false)

        // generate salt and hash the password using it
        let salt = await genSalt(SALT_WORK_FACTOR)
        let hashedPwd = await hash(newPassword, salt)
        
        // override the cleartext password with the hashed one
        await User.findOneAndUpdate({ email: userEmail }, { password: hashedPwd })
        resolve(true)
    })
}

/**
 * Block an user (without deleting it explicitly)
 * 
 * @param userEmail email address of the user to block
 * @returns true if succesfully blocked
 */
export function blockUser(userEmail: string): Promise<boolean> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findOneAndUpdate({ email: userEmail }, { active: false })
        if (!user) return reject({ code: 404, message: 'User not found!' })

        resolve(true)
    })
}

/**
 * Check if passed token is valid and return binded user
 *
 * @param token the token to check
 * @returns 'id' of user binded to the token
 */
export function validate(token: string): Promise<ObjectId> {
    return new Promise(async (resolve: Function, reject: Function) => {
        if (!token) return reject({ code: 403, message: 'Token not provided!' })

        jwtVerify(token, authSecret, (err: any, decoded: any) => {
            if (err) return reject({ code: 401, message: 'Invalid token!' })

            resolve(decoded.id)
        })
    })
}

/**
 * TODO
 * 
 * @param _id 
 * @param userEmail 
 */
export function isActive(_id: ObjectId): Promise<boolean> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findById(_id)
        if (!user) return reject({ code: 404, message: 'User not found!' })

        resolve(user.active)
    })
}

/**
 * Check if two users are the same.
 * Used to check that the user to which the token belong is
 * the same on which apply the action
 *
 * @param _id of the user in DB
 * @param userEmail email to check
 * @returns true if email address belong to user binded to 'id'
 */
export function isUser(_id: ObjectId, userEmail: string): Promise<boolean> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findById(_id)
        if (!user) return reject({ code: 404, message: 'User not found!' })

        resolve(user.email === userEmail)
    })
}

/**
 * Check if user is an admin
 *
 * @param _id of the user in the model
 * @param next true if user binded to 'id' is admin
 */
export function isAdmin(_id: ObjectId): Promise<boolean> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findById(_id)
        if (!user) return reject({ code: 404, message: 'User not found!' })

        let role = await Role.findById(user.role)
        if (!role) return reject({ code: 404, message: 'Role not found!' })

        resolve(role.name === 'admin')
    })
}