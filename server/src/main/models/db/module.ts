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
    description: string,
    deadline: Date,
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

/**
 * States in the system
 * 
 * @author Paolo Baldini
 */
export enum States {
    TODO = 'TO-DO',
    IN_PROGRESS = 'IN-PROGRESS',
    DONE = 'DONE'
}
export namespace States {
    export function parse(value: string) {
        switch(value.toUpperCase()) {
            case 'TODO':
            case States.TODO:
                return States.TODO
            case States.IN_PROGRESS:
                return States.IN_PROGRESS
            case States.DONE:
                return States.DONE
        }
    }
}

/**
 * Schema of KANBAN ITEM document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBKanbanItem extends Document {
    taskDescription: string,
    status: string,
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
            States.TODO,
            States.IN_PROGRESS,
            States.DONE
        ],
        required: true,
        default: States.TODO
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
    description: String,
    deadline: Date,
    developers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    chatMessages: [ MessageSchema ],
    kanbanItems: [ KanbanItemSchema ]
})