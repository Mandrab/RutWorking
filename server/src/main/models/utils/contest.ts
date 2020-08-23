/**
 * Contains utilities to work on contests
 * 
 * @author Paolo Baldini
 */
import { set as mongooseSet } from 'mongoose'
import { DBUser } from '../db'

mongooseSet('useFindAndModify', false)

export async function resetContest() {
    await DBUser.updateMany({}, { $unset: { score: "" } })
}

export async function getStatus(skipN: number) {
    let users = await DBUser.aggregate([
        { $match: { score: { $ne: null } } },
        { $sort: { score: -1 } },
        { $skip: skipN },
        { $limit: 100 }
    ])
    return users.map(it => {
        return {
            email: it.email,
            name: it.name,
            surname: it.surname,
            score: it.score
        }
    })
}