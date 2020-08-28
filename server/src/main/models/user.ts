import { IDBUser, DBUser } from "./db";
import { Schema } from "mongoose";
import { Role } from ".";
import { genSalt, hash, compare } from "bcrypt";
import { SALT_WORK_FACTOR } from "./db/user";
import { verify } from "jsonwebtoken";
import { secret } from "../config/jwt";

/**
 * Represent a user in the system with some utility methods
 * 
 * @author Paolo Baldini
 */
export class User {
    _id(): Schema.Types.ObjectId { return this.user._id }
    name(): string { return this.user.name }
    surname(): string { return this.user.surname }
    email(): string { return this.user.email }
    hashedPassword(): string { return this.user.password }
    roleID(): Schema.Types.ObjectId { return this.user.role }
    role(): Promise<Role> { return Role.findById(this.user.role) }
    isActive(): boolean { return this.user.active }
    firebaseToken(): string { return this.user.firebaseToken }

    private constructor(private user: IDBUser) { }

    /**
     * Check if passed password is equal to ones of the user
     * 
     * @param toCheck password to check equality
     * @returns true if the two password are equals 
     */
    comparePassword(toCheck: string): Promise<boolean> {
        return compare(toCheck, this.hashedPassword())
    }

    /**
     * Change password of the user
     * 
     * @param newPassword the new password to set
     */
    async changePassword(newPassword: string) {
        // generate salt and hash the password using it
        let salt = await genSalt(SALT_WORK_FACTOR)
        let hashedPwd = await hash(newPassword, salt)
        
        // override the cleartext password with the hashed one
        this.user = await DBUser.findByIdAndUpdate(this._id(), { password: hashedPwd })
    }

    /**
     * Block or unblock the user
     * 
     * @param block if true, block the user; if false, unblock it
     */
    async block(block: boolean = true) {
        let user = await DBUser.findByIdAndUpdate(this._id(), { active: !block })

        this.user = user
    }

    /**
     * Create an user object by the user found throught the `searchStrategy`
     *
     * @param searchStrategy used to find user in DB
     * @returns the user object
     */
    static async find(searchStrategy: () => Promise<IDBUser> | IDBUser): Promise<User> {
        let user = await searchStrategy()
        if (!user) throw { code: 404, message: 'User not found!' }

        return new User(user)
    }

    /**
     * Create an user object by the user found throught his `id`
     *
     * @param _id of the user in the DB
     * @returns the user object
     */
    static findById(_id: Schema.Types.ObjectId | string): Promise<User> {
        return User.find(async () => DBUser.findById(_id))
    }

    /**
     * Create an user object by the user found throught his `email` address
     *
     * @param email of the user in the DB
     * @returns the user object
     */
    static findByEmail(email: string): Promise<User> {
        return User.find(async () => DBUser.findOne({ email: email }))
    }

    /**
     * Create an user object by the user found throught his `token`
     *
     * @param token token binded to the user
     * @returns the user object
     */
    static async findByToken(token: string): Promise<User> {
        if (token && token.startsWith('Bearer ')) token = token.split(' ')[1]
        if (!token) throw { code: 500, message: 'Token has not been passed!' }

        return new Promise((resolve: any, reject: any) => {
            verify(token, secret, (err: any, decoded: any) => {
                if (err) reject({ code: 401, message: 'Invalid token!' })
                resolve(User.findById(decoded.id))
            })
        })
    }
}