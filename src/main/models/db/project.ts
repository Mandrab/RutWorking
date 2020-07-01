import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'
import { ModuleSchema, IDBModule } from './module'

mongooseSet('useCreateIndex', true)

/**
 * Schema of PROJECT document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBProject extends Document {
    name: string
    chief: Schema.Types.ObjectId
    modules: Array<IDBModule>
}

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    chief: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    modules: [ ModuleSchema ]
})

export let DBProject = mongooseModel<IDBProject>('Project', projectSchema)