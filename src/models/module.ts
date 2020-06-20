import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Schema of MODULE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IModule extends Document {
    name: string,
    chief: Schema.Types.ObjectId,
    developers: Array<Schema.Types.ObjectId>,
    chatMessages: Array<IMessage>,
    kanbanItems: Array<IKanbanItem>
}

/**
 * Schema of CHAT MESSAGE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IMessage extends Document {
    data: Date,
    sender: Schema.Types.ObjectId,
    message: string
}

/**
 * Schema of KANBAN ITEM document in the DB
 *
 * @author Paolo Baldini
 */
export interface IKanbanItem extends Document {
    taskDescription: string,
    status: Schema.Types.ObjectId,
    assignee: Schema.Types.ObjectId,
}

const moduleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    chief: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    developers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    chatMessages: [{
        data: Date,
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        message: String
    }],
    kanbanItems: [{
        taskDescription: String,
        status: {
            type: Schema.Types.ObjectId,
            ref: "Status"
        },
        assignee: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }]
})

module.exports = mongooseModel('Module', moduleSchema)