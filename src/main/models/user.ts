import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'
import { genSalt, hash } from 'bcrypt'     // to auto-manage password salting

export const SALT_WORK_FACTOR = 10     // to slow down brute force attacks (inc to make it harder)

mongooseSet('useCreateIndex', true)

/**
 * Schema of USER document in the DB
 *
 * @author Paolo Baldini
 */
export interface IUser extends Document {
    email: string
    password: string
    role: Schema.Types.ObjectId    // only user or admin. Not both
    active: boolean
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // a.t.m., only user or admin. Not both
    role: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})

userSchema.pre('save', async function (next) {
    let user = <IUser>this

    // generate a salt
    let salt = await genSalt(SALT_WORK_FACTOR)

    // hash the password using our new salt
    let hashedPwd = await hash(user.password, salt)

    // override the cleartext password with the hashed one
    user.password = hashedPwd
    next()
})

export let User = mongooseModel<IUser>('User', userSchema)