/**
 * Contains utilities to work on modules
 * 
 * @author Paolo Baldini
 */
import { Schema } from "mongoose"
import { User, Project } from ".."
import { DBProject } from "../db"

export async function newModule(name: string, chiefID: Schema.Types.ObjectId | string, projectName: string) {
    let user = await User.findById(chiefID)
    let project = await Project.findByName(projectName)

    project.newModule(name, user._id())
    return { code: 200, message: ''}
}

export async function getModuleInfo(projectName: string, moduleName: string) {
    let project = await Project.findByName(projectName)
    let module = project.modules().find(it => it.name() === moduleName)
    if (!module) throw { code: 404, message: 'Module not found!' }

    let chief = await module.chief()
    let developers = await Promise.all(module.developers())
    return {
        name: module.name(),
        chief: chief.email(),
        developers: developers.map(it => it.email())
    }
}

export async function addDeveloper(projectName: string, moduleName: string, userEmail: string) {
    let user = await User.findByEmail(userEmail)
    let project = await Project.findByName(projectName)
    let module = project.modules().find(it => it.name() === moduleName)

    module.addDevelop(user._id())
}

export async function getTasks(projectName: string, moduleName: string, skipFirst: number = 0, userID?: Schema.Types.ObjectId) {
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
        { $limit: 100 },
        { $project: { "modules.kanbanItems._id": 0 } }
    ])

    let flatTasks = await DBProject.aggregate(query)
    let tasks = flatTasks.map(it => it.modules.kanbanItems).map(async it => {
        let res: any = {
            id: it._id,
            taskDescription: it.taskDescription,
            status: it.status
        }
        if (it.assignee) res.assignee = (await User.findById(it.assignee)).email()
        return res
    })
    return Promise.all(tasks)
}

export async function getMessages(projectName: string, moduleName: string, skipFirst: number = 0) {
    let query: any[] = [
        { $match: { name: projectName } },          // find the project
        { $project: { _id: 0, modules: 1 } },       // get only modules
        { $unwind: "$modules" },
        { $match: { "modules.name": moduleName } },
        { $project: { "modules.chatMessages": 1 } }, // get only kanban items
        { $unwind: "$modules.chatMessages" },
        { $sort: { "modules.chatMessages._id": 1 } },
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