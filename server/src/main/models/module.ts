import { IDBModule, IDBMessage, IDBKanbanItem, DBProject } from "./db"
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

    constructor(private module: IDBModule) { }

    /**
     * Add a new message to the module chat
     * 
     * @param id of the sender
     * @param chiefID id of module chief
     */
    async newMessage(senderID: Schema.Types.ObjectId, body: string, projectID: Schema.Types.ObjectId) {
        await DBProject.updateOne({_id: projectID, "modules._id": this._id() }, {
            $push: { "modules.$.chatMessages": {
                date: new Date(),
                sender: senderID,
                message: body
            } as IDBMessage }
        })
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
    _id(): Schema.Types.ObjectId
    taskDescription(): string
    status(): Schema.Types.ObjectId
    assigneeID(): Schema.Types.ObjectId
    assignee(): Promise<User>
}

class KanbanItem implements IKanbanItem {
    _id(): Schema.Types.ObjectId { return this.kanbanItem._id }
    taskDescription(): string { return this.kanbanItem._id }
    status(): Schema.Types.ObjectId { return this.kanbanItem.status }
    assigneeID(): Schema.Types.ObjectId { return this.kanbanItem.assignee }
    assignee(): Promise<User> { return User.findById(this.kanbanItem.assignee) }

    constructor(private kanbanItem: IDBKanbanItem) { }
}