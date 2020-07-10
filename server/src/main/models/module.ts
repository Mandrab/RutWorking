import { IDBModule, IDBMessage, IDBKanbanItem, DBProject } from "./db"
import { Schema } from "mongoose"
import { User } from "."
import { KANBAN_STATES } from "./db/module"

/**
 * Represent a project module in the system with some utility methods
 *
 * @author Paolo Baldini
 */
export class Module {
    _id(): Schema.Types.ObjectId { return this.module._id }
    parent(): Schema.Types.ObjectId { return this.parentID }
    name(): string { return this.module.name }
    chiefID(): Schema.Types.ObjectId { return this.module.chief }
    chief(): Promise<User> { return User.findById(this.module.chief) }
    description() { return this.module.description }
    deadline() { return this.module.deadline }
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

    constructor(private module: IDBModule, private parentID: Schema.Types.ObjectId) { }

    async delete() {
        return await DBProject.updateOne({ _id: this.parentID }, {
            $pull: { "modules": { name: this.name() } }
        })
    }

    async addDeveloper(userID: Schema.Types.ObjectId) {
        await DBProject.updateOne({_id: this.parentID, "modules._id": this._id() }, {
            $addToSet: { "modules.$.developers": userID }
        })
    }

    async removeDeveloper(userID: Schema.Types.ObjectId) {
        // remove user from module developers
        await DBProject.updateOne(
            { _id: this.parentID, "modules._id": this._id() },
            { $pull: { "modules.$.developers": userID } }
        )
        // reset user's task in-progress as to-do
        await DBProject.updateMany(
            { _id: this.parentID },
            {
                $set: { "modules.$[module].kanbanItems.$[kanbanItem].status": KANBAN_STATES.TODO },
                $unset: { "modules.$[module].kanbanItems.$[kanbanItem].assignee": "" }
            }, {
                arrayFilters : [
                    { "module._id" : this._id() },
                    {
                        "kanbanItem.status": { $ne: KANBAN_STATES.DONE },
                        "kanbanItem.assignee": userID
                    }
                ] 
            }
        )
    }

    /**
     * Add a new message to the module chat
     * 
     * @param id of the sender
     * @param chiefID id of module chief
     * @param projectID parent project of the module
     */
    async newMessage(senderID: Schema.Types.ObjectId, body: string) {
        await DBProject.updateOne({_id: this.parentID, "modules._id": this._id() }, {
            $push: { "modules.$.chatMessages": {
                date: new Date(),
                sender: senderID,
                message: body
            } as IDBMessage }
        })
    }

    /**
     * Add a new task to the module kanban
     * 
     * @param description tasks description
     * @param projectID parent project of the module
     */
    async newTask(description: string) {
        await DBProject.updateOne({_id: this.parentID, "modules._id": this._id() }, {
            $push: { "modules.$.kanbanItems": { taskDescription: description } }
        })
    }

    /**
     * Update the status of a task of the module kanban
     * 
     * @param description tasks description
     * @param projectID parent project of the module
     */
    async updateTaskStatus(taskID: Schema.Types.ObjectId, newStatus: KANBAN_STATES, assignee?: Schema.Types.ObjectId) {
        if (newStatus !== KANBAN_STATES.TODO && !assignee) throw { code: 400, message: 'No assignee specified!' }

        let update: any = { "modules.$[module].kanbanItems.$[kanbanItem].status": newStatus }
        if (newStatus !== KANBAN_STATES.TODO) {     // not set assignee in TODO state
            await User.findById(assignee)           // check existence
            update = {
                "modules.$[module].kanbanItems.$[kanbanItem].status": newStatus,
                "modules.$[module].kanbanItems.$[kanbanItem].assignee": assignee
            }
        }

        await DBProject.updateOne(
            { _id: this.parentID },
            { $set: update },
            { arrayFilters : [{ "module._id" : this._id() }, { "kanbanItem._id" : taskID }] }
        )
    }

    async refresh() {
        this.module = (await DBProject.findById(this.parentID)).modules.find(it =>
            it._id.toString() === this._id().toString()
        )
        if (!module) throw { code: 404, message: 'Module not found' }
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
    status(): string,
    assigneeID(): Schema.Types.ObjectId
    assignee(): Promise<User>
}

class KanbanItem implements IKanbanItem {
    _id(): Schema.Types.ObjectId { return this.kanbanItem._id }
    taskDescription(): string { return this.kanbanItem._id }
    status(): string { return this.kanbanItem.status }
    assigneeID(): Schema.Types.ObjectId { return this.kanbanItem.assignee }
    assignee(): Promise<User> { return User.findById(this.kanbanItem.assignee) }

    constructor(private kanbanItem: IDBKanbanItem) { }
}