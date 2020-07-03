/**
 * Contains utilities to work on projects
 * 
 * @author Paolo Baldini
 */
import { Project, User } from "."
import { DBProject } from "./db"

export async function newProject(name: string, chiefID: string) {
    let user = await User.findById(chiefID)

    await new DBProject({ name: name, chief: user._id(), modules: [] }).save()

    return { code: 201, message: ''}
}

export async function newModule(name: string, chiefID: string, projectName: string) {
    let user = await User.findById(chiefID)
    let project = await Project.findByName(projectName)

    project.newModule(name, user._id())
    return { code: 200, message: ''}
}

export async function getProjects(skipFirst: number = 0) {
    let projects = await DBProject.find().skip(skipFirst).sort({ _id: 1 }).limit(100)

    let reshapedProjects = projects.map(async it => {
        return {
            name: it.name,
            chief: (await User.findById(it.chief)).email(),
            modules: it.modules.map(it => it.name)
        }
    })
    return await Promise.all(reshapedProjects)
}