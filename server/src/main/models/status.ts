import { IDBState, DBState } from "./db";
import { Schema } from "mongoose";

/**
 * States in the system
 * 
 * @author Paolo Baldini
 */
export enum States {
    TODO = 'To-Do',
    IN_PROGRESS = 'In-Progress',
    DONE = 'Done'
}

/**
 * Represent a state in the system with some utility methods
 * 
 * @author Paolo Baldini
 */
export class State {
    _id(): Schema.Types.ObjectId { return this.state._id }
    name(): string { return this.state.name }

    private constructor(private state: IDBState) { }

    /**
     * Create a state object by the state found throught the `searchStrategy`
     *
     * @param searchStrategy used to find state in DB
     * @returns the state object
     */
    static find(searchStrategy: () => Promise<IDBState> | IDBState): Promise<State> {
        return new Promise(async (resolve: any, reject: any) => {
            let state = await searchStrategy()
            if (!state) return reject({ code: 404, message: 'State not found!' })

            resolve(new State(state))
        })
    }

    /**
     * Create a state object by the state found throught his `id`
     *
     * @param _id of the state in the DB
     * @returns the state object
     */
    static findById(_id: Schema.Types.ObjectId | string): Promise<State> {
        return State.find(async () => DBState.findById(_id))
    }

    /**
     * Create a state object by the state found throught his `name`
     *
     * @param name of the state in the DB
     * @returns the state object
     */
    static findByName(name: string): Promise<State> {
        return State.find(async () => DBState.findOne({ name: name }))
    }
}