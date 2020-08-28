import { Document, Schema, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Interface of MODULE document in the DB
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
 * Interface of CHAT MESSAGE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBMessage extends Document {
    date: Date,
    sender: Schema.Types.ObjectId,
    message: string
}

/**
 * Interface of KANBAN ITEM document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBKanbanItem extends Document {
    name: string,
    description: string,
    status: string,
    assignee: Schema.Types.ObjectId,
}

/**
 * States in the system
 * 
 * @author Paolo Baldini
 */
export enum States {
    TODO = 'TO-DO',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN-PROGRESS',
    DONE = 'DONE'
}
export namespace States {

    /**
     * Convert a string into a state
     * 
     * @param value the string to convert
     * @returns the correspondent state or nothing if a invalid string is passed
     */
    export function parse(value: string) {
        switch(value.toUpperCase()) {
            case 'TODO':
            case States.TODO:
                return States.TODO
            case States.ASSIGNED:
                return States.ASSIGNED
            case States.IN_PROGRESS:
                return States.IN_PROGRESS
            case States.DONE:
                return States.DONE
        }
    }
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

const KanbanItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            States.TODO,
            States.ASSIGNED,
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