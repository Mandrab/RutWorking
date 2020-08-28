import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Interface of ROLE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBRole extends Document {
    name: string
}

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

export let DBRole = mongooseModel<IDBRole>('Role', roleSchema)