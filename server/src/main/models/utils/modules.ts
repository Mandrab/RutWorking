/**
 * Contains utilities to work on modules
 * 
 * @author Paolo Baldini
 */
import { Schema } from "mongoose"
import { User, Project } from ".."
import { DBProject } from "../db"

/**
 * Create a new module of a project
 * 
 * @param name of the module
 * @param chiefID of the module
 * @param projectName parent project
 * @param description optional description
 * @param deadline optional deadline
 * @returns an object containing a code 200 if all goes well
 */
export async function newModule(
    name: string, chiefID: Schema.Types.ObjectId | string,
    projectName: string,
    description?: string,
    deadline?: string
) {
    let user = await User.findById(chiefID)
    let project = await Project.findByName(projectName)

    await project.newModule(name, user._id(), description, deadline ? new Date(deadline) : null)
    return { code: 200, message: ''}
}

/**
 * Get info about the module
 * 
 * @param projectName parent project
 * @param moduleName name of the module to get
 * @returns an object containing: module name, chief and developers emails and eventually deadline and description
 */
export async function getModuleInfo(projectName: string, moduleName: string) {
    let project = await Project.findByName(projectName)
    let module = project.modules().find(it => it.name() === moduleName)
    if (!module) throw { code: 404, message: 'Module not found!' }

    let chief = await module.chief()
    let developers = await Promise.all(module.developers())
    let result: any = {
        name: module.name(),
        chief: chief.email()
    }
    if (module.description()) result.description = module.description()
    if (module.deadline()) result.deadline = module.deadline()
    result.developers = developers.map(it => it.email())
    return result
}

/**
 * Set a user as a developer of the module
 * 
 * @param projectName parent project
 * @param moduleName name of the module
 * @param userEmail email of the user to add
 */
export async function addDeveloper(projectName: string, moduleName: string, userEmail: string) {
    let user = await User.findByEmail(userEmail)
    let project = await Project.findByName(projectName)
    let module = project.modules().find(it => it.name() === moduleName)

    module.addDeveloper(user._id())
}

/**
 * Remove a user from the list of developers of the project
 * 
 * @param projectName parent project
 * @param moduleName name of the module
 * @param userEmail to remove from developers
 */
export async function removeDeveloper(projectName: string, moduleName: string, userEmail: string) {
    let user = await User.findByEmail(userEmail)
    let project = await Project.findByName(projectName)
    let module = project.modules().find(it => it.name() === moduleName)

    await module.removeDeveloper(user._id())
}

/**
 * Get list of tasks from a module of a project
 * 
 * @param projectName parent project
 * @param moduleName name of the module
 * @param skipFirst number of task to skip
 * @param userID returns only tasks in witch user is assignee
 * @returns a list of task each containing: id, name, taskDescription, status and eventually the assignee email
 */
export async function getTasks(
    projectName: string,
    moduleName: string,
    skipFirst: number = 0,
    userID?: Schema.Types.ObjectId
) {
    let query: any[] = [
        { $match: { name: projectName } },          // find the project
        { $project: { _id: 0, modules: 1 } },       // get only modules
        { $unwind: "$modules" },
        { $match: { "modules.name": moduleName } },
        { $project: { "modules.kanbanItems": 1 } }, // get only kanban items
        { $unwind: "$modules.kanbanItems" }
    ]
    if (userID) query.push(
        { $match: { "modules.kanbanItems.assignee": userID } }
    )
    query = query.concat([
        { $sort: { "modules.kanbanItems._id": 1 } },
        { $skip: skipFirst },
        //{ $limit: 100 }
    ])

    let flatTasks = await DBProject.aggregate(query)
    let tasks = flatTasks.map(it => it.modules.kanbanItems).map(async it => {
        let res: any = {
            id: it._id,
            name: it.name,
            taskDescription: it.description,
            status: it.status
        }
        if (it.assignee) res.assignee = (await User.findById(it.assignee)).email()
        return res
    })
    return Promise.all(tasks)
}

/**
 * Returns list of messages
 * 
 * @param projectName parent project
 * @param moduleName name of the module
 * @param skipFirst number of messages to skip
 * @returns a list of messages in which each contains: date, sender email, message
 */
export async function getMessages(projectName: string, moduleName: string, skipFirst: number = 0) {
    let query: any[] = [
        { $match: { name: projectName } },          // find the project
        { $project: { _id: 0, modules: 1 } },       // get only modules
        { $unwind: "$modules" },
        { $match: { "modules.name": moduleName } },
        { $project: { "modules.chatMessages": 1 } }, // get only chat items
        { $unwind: "$modules.chatMessages" },
        { $sort: { "modules.chatMessages._id": -1 } },
        { $skip: skipFirst },
        { $limit: 100 },
        { $project: { "modules.chatMessages._id": 0 } }
    ]

    let flatMessages = await DBProject.aggregate(query)
    let messages = flatMessages.map(it => it.modules.chatMessages).map(async it => {
        return {
            date: it.date,
            sender: (await User.findById(it.sender)).email(),
            message: it.message
        }
    })
    return Promise.all(messages)
}