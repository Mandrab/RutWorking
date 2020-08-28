/**
 * Routes of RESTful API regarding contest (i.e., a competition to spot the best employee)
 * 
 * @author Paolo Baldini
 */
import { _isDeveloper, _isChief, or, isActive, isRole, _isRole } from '../auths/jwt'
import { resetContest, getStatus } from '../controllers/contest'
import { Roles } from '../models'

const isAdmin = isRole(Roles.ADMIN)
const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)

module.exports = function (app: any) {
    // admin can start/reset a contest to find the goodest employee
    app.put('/contest/reset', [
        isActive,
        isAdmin
    ], resetContest)

    // users can get the contest status (aka: ranking; point of each user)
    app.get('/contest/ranking/:skipN?', [
        isActive,
        or(_isAdmin, _isUser)
    ], getStatus)
}