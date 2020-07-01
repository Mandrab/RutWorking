/**
 * Contains utilities to work on projects
 * 
 * @author Paolo Baldini
 */
import { Result } from "./result"
import { Project, User } from "."
import { DBProject } from "./db"

export function newProject(name: string, chiefID: string): Promise<Result> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findById(chiefID)
        if (!user) return reject({ code: 404, message: 'User not found!'})

        new DBProject({ name: name, chief: user._id(), modules: [] }).save()
        resolve({ code: 200, message: ''})
    })
}

export function newModule(name: string, chiefID: string, projectName: string): Promise<Result> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findById(chiefID)
        if (!user) return reject({ code: 404, message: 'User not found!'})

        let project = await Project.findByName(projectName)
        if (!project) return reject({ code: 404, message: 'Parent project not found!'})

        project.newModule(name, user._id())
        resolve({ code: 200, message: ''})
    })
}