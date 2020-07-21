import { Roles, User, register } from "../../../main/models"
import { DBUser } from "../../../main/models/db"
import { sign } from "jsonwebtoken"
import { secret } from "../../../main/config/auth"

/**
 * Class to simplify users use on tests.
 * It set some values as default and ignore errors.
 * 
 * @author Paolo Baldini
 */
export class TestUser {
    constructor(private email: string) { }

    async register(role: Roles, name: string = 'x', surname: string = 'y', password: string = 'z') {
        return register(name, surname, this.email, password, role).catch(_ => { })
    }
    async delete() { return DBUser.deleteOne({ email: this.email }).catch(_ => { }) }
    async getUser() { return User.findByEmail(this.email) }
    async getToken() { return sign({ id: (await this.getUser())._id() }, secret, { expiresIn: 86400 }) }
}