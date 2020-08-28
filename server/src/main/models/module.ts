import { IDBModule, IDBMessage, IDBKanbanItem, DBProject, States, DBUser } from "./db"
import { Schema } from "mongoose"
import { User } from "."

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
    description(): string { return this.module.description }
    deadline(): Date { return this.module.deadline }
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

    /** Delete the module */
    async delete() {
        return await DBProject.updateOne({ _id: this.parentID }, {
            $pull: { "modules": { name: this.name() } }
        })
    }

    /**
     * Add a developer to the module
     * 
     * @param userID id of the user to add
     */
    async addDeveloper(userID: Schema.Types.ObjectId) {
        await DBProject.updateOne({_id: this.parentID, "modules._id": this._id() }, {
            $addToSet: { "modules.$.developers": userID }
        })
    }

    /**
     * Remove a developer from the module
     * 
     * @param userID id of the developer to remove
     */
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
                $set: { "modules.$[module].kanbanItems.$[kanbanItem].status": States.TODO },
                $unset: { "modules.$[module].kanbanItems.$[kanbanItem].assignee": "" }
            }, {
                arrayFilters : [
                    { "module._id" : this._id() },
                    {
                        "kanbanItem.status": { $ne: States.DONE },
                        "kanbanItem.assignee": userID
                    }
                ] 
            }
        )
    }

    /**
     * Add a new message to the module chat
     * 
     * @param senderID id of the message sender
     * @param body of the message
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
     * @param name of the task
     * @param description task description
     * @param status to-do, assigned, in-progress, done
     * @param assignee default assignee of the task
     */
    async newTask(name: string, description?: string, status?: States, assignee?: User) {
        let task: any = {
            name: name,
            description: description
        }
        if (status) task.status = status
        if (assignee) task.assignee = assignee._id()

        await DBProject.updateOne({ _id: this.parentID, "modules._id": this._id() }, {
            $push: { "modules.$.kanbanItems": task }
        })
    }

    /**
     * Update the status of a task of the module kanban
     * 
     * @param taskID id of the task to update
     * @param oldStatus actual state of the task
     * @param newStatus new status to set
     * @param oldAssignee actual assignee of the task
     * @param assignee new assignee to set
     */
    async updateTaskStatus(
        taskID: Schema.Types.ObjectId,
        oldStatus: States,
        newStatus: States,
        oldAssignee: Schema.Types.ObjectId,
        assignee?: Schema.Types.ObjectId
    ) {
        let user = await DBUser.findById(assignee)
        if (!user && newStatus !== States.TODO) throw { code: 404, message: 'User not found!' }

        let update: any = { "modules.$[module].kanbanItems.$[kanbanItem].status": newStatus }

        if (newStatus === States.TODO) {            // not set assignee in TO-DO state
            update = {
                $unset: { "modules.$[module].kanbanItems.$[kanbanItem].assignee": "" },
                $set: update
            }
        } else {
            update["modules.$[module].kanbanItems.$[kanbanItem].assignee"] = assignee
            update = { $set: update }
        }

        await DBProject.updateOne({ _id: this.parentID }, update,
            { arrayFilters : [{ "module._id" : this._id() }, { "kanbanItem._id" : taskID }] })

        // if an user has not properly completed his task his score is decreased
        // if it has completed his task, his score is incremented
        if (newStatus === States.DONE && oldStatus !== States.DONE)
            await DBUser.updateOne({ _id: assignee }, { $inc: { score: 1 } })
        else if (oldStatus === States.DONE)
            await DBUser.updateOne({ _id: oldAssignee }, { $inc: { score: -2 } })
    }

    /**
     * Remove a task from the module kanban
     * 
     * @param taskID id of the task to remove
     */
    async deleteTask(taskID: string | Schema.Types.ObjectId) {
        await DBProject.updateOne(
            { _id: this.parentID },
            { $pull: { "modules.$[module].kanbanItems": { "_id": taskID } } },
            { arrayFilters : [{ "module._id" : this._id() }] }
        )
    }

    /** Reload module informations */
    async refresh() {
        this.module = (await DBProject.findById(this.parentID)).modules.find(it =>
            it._id.toString() === this._id().toString()
        )
        if (!module) throw { code: 404, message: 'Module not found' }
    }
}

/**
 * Interface to use a message class
 * 
 * @author Paolo Baldini
 */
export interface IMessage {
    _id(): Schema.Types.ObjectId
    date(): Date
    senderID(): Schema.Types.ObjectId
    bodyMessage(): string
}

/**
 * A message class
 * 
 * @author Paolo Baldini
 */
class Message implements IMessage {
    _id(): Schema.Types.ObjectId { return this.message._id }
    date(): Date { return this.message.date }
    senderID(): Schema.Types.ObjectId { return this.message.sender }
    sender(): Promise<User> { return User.findById(this.message.sender) }
    bodyMessage(): string { return this.message.message }

    constructor(private message: IDBMessage) { }
}

/**
 * Interface to use a task class
 * 
 * @author Paolo Baldini
 */
export interface IKanbanItem {
    _id(): Schema.Types.ObjectId
    name(): string
    taskDescription(): string
    status(): string,
    assigneeID(): Schema.Types.ObjectId
    assignee(): Promise<User>
}

/**
 * A task class
 * 
 * @author Paolo Baldini
 */
class KanbanItem implements IKanbanItem {
    _id(): Schema.Types.ObjectId { return this.kanbanItem._id }
    name(): string { return this.kanbanItem.name }
    taskDescription(): string { return this.kanbanItem._id }
    status(): string { return this.kanbanItem.status }
    assigneeID(): Schema.Types.ObjectId { return this.kanbanItem.assignee }
    assignee(): Promise<User> { return User.findById(this.kanbanItem.assignee) }

    constructor(private kanbanItem: IDBKanbanItem) { }
}