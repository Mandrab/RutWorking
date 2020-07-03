import { Document, Schema, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Schema of MODULE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBModule extends Document {
    name: string,
    chief: Schema.Types.ObjectId,
    developers: Array<Schema.Types.ObjectId>,
    chatMessages: Array<IDBMessage>,
    kanbanItems: Array<IDBKanbanItem>
}

/**
 * Schema of CHAT MESSAGE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBMessage extends Document {
    date: Date,
    sender: Schema.Types.ObjectId,
    message: string
}

const MessageSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

export enum KANBAN_STATES {
    TODO = 'TO-DO',
    IN_PROGRESS = 'IN-PROGRESS',
    DONE = 'DONE'
}

/**
 * Schema of KANBAN ITEM document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBKanbanItem extends Document {
    taskDescription: string,
    status: Schema.Types.ObjectId,
    assignee: Schema.Types.ObjectId,
}

const KanbanItemSchema = new Schema({
    taskDescription: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            KANBAN_STATES.TODO,
            KANBAN_STATES.IN_PROGRESS,
            KANBAN_STATES.DONE
        ],
        required: true,
        default: KANBAN_STATES.TODO
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

export const ModuleSchema = new Schema({
    name: {
        type: String,
        required: true
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
    chatMessages: [ MessageSchema ],
    kanbanItems: [ KanbanItemSchema ]
})