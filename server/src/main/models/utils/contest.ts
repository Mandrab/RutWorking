/**
 * Contains utilities to work on contests
 * 
 * @author Paolo Baldini
 */
import { set as mongooseSet, Schema } from 'mongoose'
import { DBUser, IDBUser } from '../db'

mongooseSet('useFindAndModify', false)

/** Reset score of all the user */
export async function resetContest() {
    await DBUser.updateMany({}, { $unset: { score: "" } })
}

/**
 * Returns the first 100 ranked users
 * 
 * @param skipN number of user to skip
 * @returns a collection of users specifying foreach: name, surname, email and score
 */
export async function getStatus(skipN: number, userID?: Schema.Types.ObjectId | string) {
    let users = await DBUser.aggregate([
        { $match: { score: { $ne: null } } },
        { $sort: { score: -1 } },
        { $skip: skipN },
        { $limit: 100 }
    ])
    let scores = users.map(it => {
        return {
            email: it.email,
            name: it.name,
            surname: it.surname,
            score: it.score
        }
    })
    if (userID && !users.some(it => (it as IDBUser)._id.toString() === userID.toString())) {
        let user = await DBUser.findById(userID)
        scores = scores.concat({
            email: user.email,
            name: user.name,
            surname: user.surname,
            score: user.score ? user.score : 0
        })
    }
    return scores
}