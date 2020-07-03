/**
 * Contains utilities to work on projects
 * 
 * @author Paolo Baldini
 */
import { Project, User } from "."
import { DBProject } from "./db"
import { Schema } from "mongoose"

export async function newProject(name: string, chiefID: string, description?: string, deadline?: Date) {
    let user = await User.findById(chiefID)

    let obj: any = {
        name: name,
        chief: user._id(),
        modules: []
    }
    if (description) obj.description = description
    if (deadline) obj.deadline = deadline
    await new DBProject(obj).save()

    return { code: 201, message: 'Created'}
}

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

export async function getProjects(skipFirst: number = 0, userID?: Schema.Types.ObjectId) {
    let projects = userID ?
        await DBProject.find({ $or: [{
                chief: userID
            }, {
                "modules.chief": userID
            }, {
                "modules.developers": userID
            }]
        }).skip(skipFirst).sort({ _id: 1 }).limit(100)
        : await DBProject.find().skip(skipFirst).sort({ _id: 1 }).limit(100)

    let reshapedProjects = projects.map(async it => {
        let result: any = {
            name: it.name,
            chief: (await User.findById(it.chief)).email(),
            modules: it.modules.map(it => it.name)
        }
        if (it.description) result.description = it.description
        if (it.deadline) result.deadline = it.deadline
        return result
    })
    return await Promise.all(reshapedProjects)
}