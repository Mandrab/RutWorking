import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Schema of STATE document in the DB
 *
 * @author Paolo Baldini
 */
export interface IDBState extends Document {
    name: string
}

const stateSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

export let DBState = mongooseModel<IDBState>('Status', stateSchema)