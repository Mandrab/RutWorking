import { IDBRole, DBRole } from "./db";
import { Schema } from "mongoose";

/**
 * Roles in the system
 * 
 * @author Paolo Baldini
 */
export enum Roles {
    ADMIN = 'admin',
    USER = 'user'
}

/**
 * Represent a role in the system with some utility methods
 * 
 * @author Paolo Baldini
 */
export class Role {
    _id(): Schema.Types.ObjectId { return this.role._id }
    name(): string { return this.role.name }

    private constructor(private role: IDBRole) { }

    /**
     * Create a role object by the role found throught the `searchStrategy`
     *
     * @param searchStrategy used to find role in DB
     * @returns the role object
     */
    static find(searchStrategy: () => (Promise<IDBRole>)): Promise<Role> {
        return new Promise(async (resolve: any, reject: any) => {
            let role = await searchStrategy()
            if (!role) return reject({ code: 404, message: 'Role not found!' })

            resolve(new Role(role))
        })
    }

    /**
     * Create a role object by the role found throught his `id`
     *
     * @param _id of the role in the DB
     * @returns the role object
     */
    static findById(_id: Schema.Types.ObjectId | string): Promise<Role> {
        return Role.find(async () => DBRole.findById(_id))
    }

    /**
     * Create a role object by the role found throught his `name`
     *
     * @param name of the role in the DB
     * @returns the role object
     */
    static findByName(name: string): Promise<Role> {
        return Role.find(async () => await DBRole.findOne({ name: name }))
    }
}