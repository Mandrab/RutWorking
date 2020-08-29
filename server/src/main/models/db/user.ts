import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'
import { genSalt, hash } from 'bcrypt'     // to auto-manage password salting

export const SALT_WORK_FACTOR = 10     // to slow down brute force attacks (inc to make it harder)

mongooseSet('useCreateIndex', true)

/**
 * Possible notification topics
 * 
 * @author Paolo Baldini
 */
export enum Topics {
    CHAT_MESSAGE = 'chat_message',
    TASK_COMPLETED = 'task_completed',
    DEVELOPER_ADDED = 'developer_added'
}

/**
 * Interface of NOTIFICATION document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBNotification extends Document {
    topic: string,
    projectName: string,
    moduleName: string,
    message: string,
    senderEmail: string,
    seen: boolean
}

/**
 * Interface of USER document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBUser extends Document {
    name: string,
    surname: string,
    email: string,
    password: string,
    role: Schema.Types.ObjectId,    // only user or admin. Not both
    active: boolean,
    firebaseToken: string,
    notifications: Array<IDBNotification>
}

const notificationSchema = new Schema({
    topic: {
        type: String,
        enum: [
            Topics.CHAT_MESSAGE,
            Topics.DEVELOPER_ADDED,
            Topics.TASK_COMPLETED
        ],
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    moduleName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    senderEmail: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        required: true,
        default: false
    }
})

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
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
    },
    score: {
        type: Number
    },
    firebaseToken: String,
    notifications: [ notificationSchema ]
})

/** Before save hash user password */
userSchema.pre('save', async function (next) {
    let user = <IDBUser>this

    // generate a salt
    let salt = await genSalt(SALT_WORK_FACTOR)

    // hash the password using our new salt
    let hashedPwd = await hash(user.password, salt)

    // override the cleartext password with the hashed one
    user.password = hashedPwd
    next()
})

export let DBUser = mongooseModel<IDBUser>('User', userSchema)