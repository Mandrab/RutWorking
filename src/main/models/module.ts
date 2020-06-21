import { IDBModule, DBModule, IDBMessage, IDBKanbanItem } from "./db"
import { Schema } from "mongoose"
import { User } from "."

/**
 * Represent a project module in the system with some utility methods
 *
 * @author Paolo Baldini
 */
export class Module {
    _id(): Schema.Types.ObjectId { return this.module._id }
    name(): string { return this.module.name }
    chiefID(): Schema.Types.ObjectId { return this.module.chief }
    chief(): Promise<User> { return User.findById(this.module.chief) }
    developersIDs(): Array<Schema.Types.ObjectId> { return this.module.developers }
    developers(): Array<Promise<User>> {
        return this.module.developers.map((developerID: Schema.Types.ObjectId) => User.findById(developerID))
    }
    chatMessages(): Array<IMessage> {
        return this.module.chatMessages.map((message: IDBMessage) => new Message(message))
    }
    kanbanItems(): Array<IKanbanItem> {
        return this.module.kanbanItems.map((item: IDBKanbanItem) => new KanbanItem(item))
    }

    private constructor(private module: IDBModule) { }

    /**
     * Create a module object by the module found throught the `searchStrategy`
     *
     * @param searchStrategy used to find module in DB
     * @returns the module object
     */
    static find(searchStrategy: () => Promise<IDBModule> | IDBModule): Promise<Module> {
        return new Promise(async (resolve: any, reject: any) => {
            let module = await searchStrategy()
            if (!module) return reject({ code: 404, message: 'Module not found!' })

            resolve(new Module(module))
        })
    }

    /**
     * Create a module object by the module found throught his `id`
     *
     * @param _id of the module in the DB
     * @returns the module object
     */
    static findById(_id: Schema.Types.ObjectId | string): Promise<Module> {
        return Module.find(async () => DBModule.findById(_id))
    }

    /**
     * Create a module object by the module found throught his `name`
     *
     * @param name of the module in the DB
     * @returns the module object
     */
    static findByName(name: string): Promise<Module> {
        return Module.find(async () => DBModule.findOne({ name: name }))
    }
}

export interface IMessage {
    _id(): Schema.Types.ObjectId
    date(): Date
    senderID(): Schema.Types.ObjectId
    bodyMessage(): string
}

class Message implements IMessage {
    _id(): Schema.Types.ObjectId { return this.message._id }
    date(): Date { return this.message.date }
    senderID(): Schema.Types.ObjectId { return this.message.sender }
    sender(): Promise<User> { return User.findById(this.message.sender) }
    bodyMessage(): string { return this.message.message }

    constructor(private message: IDBMessage) { }
}

export interface IKanbanItem {
    taskDescription(): string
    status(): Schema.Types.ObjectId
    assigneeID(): Schema.Types.ObjectId
    assignee(): Promise<User>
}

class KanbanItem implements IKanbanItem {
    taskDescription(): string { return this.kanbanItem._id }
    status(): Schema.Types.ObjectId { return this.kanbanItem.status }
    assigneeID(): Schema.Types.ObjectId { return this.kanbanItem.assignee }
    assignee(): Promise<User> { return User.findById(this.kanbanItem.assignee) }

    constructor(private kanbanItem: IDBKanbanItem) { }
}