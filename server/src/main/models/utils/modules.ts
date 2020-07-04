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

export async function addDevelop(projectName: string, moduleName: string, userEmail: string) {
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
    return flatTasks.map(it => it.modules.kanbanItems)
}