/**
 * Contains utilities to work on projects
 * 
 * @author Paolo Baldini
 */
import { Result } from '../result'
import { User } from '../user'
import { Project } from '../project'

export function newProject(name: string, chiefID: string): Promise<Result> {
    return new Promise(async (resolve: Function, reject: Function) => {
        let user = await User.findById(chiefID)
        if (!user) return reject({ code: 404, message: 'User not found!'})

        new Project({ name: name, chief: user._id, modules: [] }).save()
        resolve({ code: 200, message: ''})
    })
}