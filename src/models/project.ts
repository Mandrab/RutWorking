import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Schema of PROJECT document in the DB
 *
 * @author Paolo Baldini
 */
export interface IProject extends Document {
    name: string
    chief: Schema.Types.ObjectId
    modules: Array<Schema.Types.ObjectId>
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
    modules: [ {
        type: Schema.Types.ObjectId,
        ref: "Module"
    } ]
})

export let Project = mongooseModel<IProject>('Project', projectSchema)