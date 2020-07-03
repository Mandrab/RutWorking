import { Schema } from "mongoose";
import { IDBProject, DBProject, IDBModule } from "./db";
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
    modules(): Array<Module> { return this.project.modules.map(it => new Module(it)) }

    private constructor(private project: IDBProject) { }
    
    /**
     * Add a new module to the project
     * 
     * @param _name of the module
     * @param chiefID id of module chief
     */
    async newModule(_name: string, chiefID: Schema.Types.ObjectId) {
        await DBProject.updateOne({_id: this._id(), "modules.name": { "$ne": _name } }, {
            $push: { modules: {
                name: _name,
                chief: chiefID,
                developers: [],
                chatMessages: [],
                kanbanItems: []
            } as IDBModule }
        })
    }

    /**
     * Create a project object by the project found throught the `searchStrategy`
     *
     * @param searchStrategy used to find project in DB
     * @returns the project object
     */
    static async find(searchStrategy: () => Promise<IDBProject> | IDBProject): Promise<Project> {
        let project = await searchStrategy()
        if (!project) throw { code: 404, message: 'Project not found!' }

        return new Project(project)
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