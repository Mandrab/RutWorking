import { Schema } from "mongoose";
import { IDBProject, DBProject } from "./db";
import { User, Module } from ".";

/**
 * Represent a project in the system with some utility methods
 *
 * @author Paolo Baldini
 */
export class Project {
    _id(): Schema.Types.ObjectId { return this.project._id }
    name(): string { return this.project.name }
    chiefID(): Schema.Types.ObjectId { return this.project.chief }
    chief(): Promise<User> { return User.findById(this.project.chief) }
    modulesIDs(): Array<Schema.Types.ObjectId> { return this.project.modules }
    modules(): Array<Promise<Module>> {
        return this.project.modules.map((moduleID: Schema.Types.ObjectId) => { return Module.findById(moduleID) })
    }

    private constructor(private project: IDBProject) { }

    /**
     * Create a project object by the project found throught the `searchStrategy`
     *
     * @param searchStrategy used to find project in DB
     * @returns the project object
     */
    static find(searchStrategy: () => Promise<IDBProject> | IDBProject): Promise<Project> {
        return new Promise(async (resolve: any, reject: any) => {
            let project = await searchStrategy()
            if (!project) return reject({ code: 404, message: 'Project not found!' })

            resolve(new Project(project))
        })
    }

    /**
     * Create a project object by the project found throught his `id`
     *
     * @param _id of the project in the DB
     * @returns the project object
     */
    static findById(_id: Schema.Types.ObjectId | string): Promise<Project> {
        return Project.find(async () => DBProject.findById(_id))
    }

    /**
     * Create a project object by the project found throught his `name`
     *
     * @param name of the project in the DB
     * @returns the project object
     */
    static findByName(name: string): Promise<Project> {
        return Project.find(async () => DBProject.findOne({ name: name }))
    }
}