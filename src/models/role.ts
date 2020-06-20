import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Schema of ROLE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IRole extends Document {
    name: string
}

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

export let Role = mongooseModel<IRole>('Role', roleSchema)