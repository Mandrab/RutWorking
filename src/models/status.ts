import { Document, Schema, model as mongooseModel, set as mongooseSet } from 'mongoose'

mongooseSet('useCreateIndex', true)

/**
 * Schema of STATUS document in the DB
 *
 * @author Paolo Baldini
 */
export interface IStatus extends Document {
    name: string
}

const statusSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

export let Status = mongooseModel<IStatus>('Status', statusSchema)