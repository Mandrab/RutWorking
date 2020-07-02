/**
 * Routes of RESTful API regarding users
 * 
 * @author Paolo Baldini
 */
import { isActive, isRole, or, _isRole } from '../auths/jwt'
import { login, register, blockUser, changePassword, getUserInfo } from '../controllers/user'
import { Roles } from '../models'

const isAdmin = isRole(Roles.ADMIN)
const isUser = isRole(Roles.USER)
const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)

module.exports = function (app: any) {
    // login a user and get a token
    app.post('/login', login)

    // an ADMIN can register a new user (we are in a corporate context)
    app.post('/user/:userEmail', [isActive, isAdmin], register)

    // the USER can change his password
    app.put('/user/:userEmail', [isActive, isUser], changePassword)

    // get info of a user
    app.get('/user/:userEmail', [isActive, or(_isUser, _isAdmin)], getUserInfo)

    // an ADMIN can block a user
    app.delete('/user/:userEmail', [isActive, isAdmin], blockUser)
}