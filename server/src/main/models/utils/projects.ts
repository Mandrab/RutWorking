/**
 * Contains utilities to work on projects
 * 
 * @author Paolo Baldini
 */
import { Project, User } from ".."
import { DBProject } from "../db"
import { Schema } from "mongoose"

/**
 * Insert a new project in db
 * 
 * @param name of the project to insert
 * @param chiefID id of the project chief
 * @param description of the project. Optional value
 * @param deadline of the project. Optional value
 * @returns an object containing a code 200
 */
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

/**
 * Returns list of projects
 * 
 * @param skipFirst number of project to skip
 * @param userID filter returning only the project in which the user works (is developer in module)
 * @returns an collection in which each project contains: name, chief email, modules (each containing: name,
 *  chief email, description, deadline and an optional flag 'member' to indicate if the optional user is
 *  developer in the module) and optionally a description and a deadline
 */
export async function getProjects(skipFirst: number = 0, userID?: Schema.Types.ObjectId) {
    let projects = userID ?
        await DBProject.find({ $or: [{
                chief: userID
            }, {
                "modules.chief": userID
            }, {
                "modules.developers": userID
            }]
        }).skip(skipFirst).sort({ _id: 1 })//.limit(100)
        : await DBProject.find().skip(skipFirst).sort({ _id: 1 }).limit(100)

    let reshapedProjects = projects.map(async it => {
        let result: any = {
            name: it.name,
            chief: (await User.findById(it.chief)).email(),
            modules: await Promise.all(
                it.modules.map(async it => {
                    let module: any = {
                        name: it.name,
                        chief: (await User.findById(it.chief)).email()
                    }
                    if (it.description) module.description = it.description
                    if (it.deadline) module.deadline = it.deadline
                    if (userID) module.member = it.chief.toString() === userID.toString()
                        || it.developers.map(id => id.toString()).includes(userID.toString())
                    return module
                })
            )
        }
        if (it.description) result.description = it.description
        if (it.deadline) result.deadline = it.deadline

        return result
    })
    return await Promise.all(reshapedProjects)
}

/**
 * Returns info about the project
 * 
 * @param projectName name of the project to search
 * @returns a project containing: name, chief email, modules (each containing: name, chief email, description,
 *  deadline) and optionally a description and a deadline
 */
export async function getProjectInfo(projectName: string) {
    let project = await Project.findByName(projectName)
    let chief = await project.chief()

    let result: any = {
        name: project.name(),
        chief: chief.email(),
        modules: await Promise.all(
            project.modules().map(async it => {
                let module: any = {
                    name: it.name(),
                    chief: (await it.chief()).email()
                }
                if (it.description()) module.description = it.description()
                if (it.deadline()) module.deadline = it.deadline()
                return module
            })
        )
    }
    if (project.description()) result.description = project.description()
    if (project.deadline()) result.deadline = project.deadline()

    return result
}