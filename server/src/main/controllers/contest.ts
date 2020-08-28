/**
 * Manage input-output request for the contest
 * 
 * @author Paolo Baldini
 */
import { resetContest as _resetContest, getStatus as _getStatus } from '../models'
import { _admin } from '../config/firebase'

/**
 * Reset all users scores
 * 
 * @param request web query
 * @param result query result
 */
export async function resetContest(_: any, result: any) {
    try {
        let users = await _resetContest()

        result.status(200).send(users)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}

/**
 * Get 100 user ranked for the contest
 * 
 * @param request web query
 * @param result query result
 */
export async function getStatus(request: any, result: any) {
    try {
        let skipUsers = request.params.skipN ? parseInt(request.params.skipN, 10) : 0

        let users = await _getStatus(skipUsers)

        result.status(200).send(users)
    } catch (err) {
        if (err.code && err.message) result.status(err.code).send(err.message)
        else result.status(500).send('Internal error')
    }
}