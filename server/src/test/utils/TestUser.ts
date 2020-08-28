import { Roles, User, register } from "../../main/models"
import { DBUser } from "../../main/models/db"
import { sign } from "jsonwebtoken"
import { secret } from "../../main/config/auth"

/**
 * Class to simplify users use on tests.
 * It set some values as default and ignore some errors.
 * 
 * @author Paolo Baldini
 */
export class TestUser {
    constructor(readonly email: string) { }

    /**
     * Autonomously register the user into mongo db
     * 
     * @param role of the user
     * @param name of the user
     * @param surname of the user
     * @param password of the user (in clear)
     */
    async register(role: Roles, name: string = 'x', surname: string = 'y', password: string = 'z') {
        return register(name, surname, this.email, password, role).catch(_ => { })
    }

    /**
     * Autonomously delete the user from mongo db
     */
    async delete() { return DBUser.deleteOne({ email: this.email }).catch(_ => { }) }

    /**
     * Autonomously search for the user into mongo db
     * 
     * @returns the model's User class
     */
    async getUser() { return User.findByEmail(this.email) }

    /**
     * Autonomously generate a JWT for the user
     * 
     * @returns the token string
     */
    async getToken() { return sign({ id: (await this.getUser())._id() }, secret, { expiresIn: 86400 }) }
}