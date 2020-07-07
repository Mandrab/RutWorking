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
    // login as an user and get a token
    app.post('/login', login)

    // Admins can register new users (we are in a corporate context)
    app.post('/user/:userEmail', [isActive, isAdmin], register)

    // User can change his own password
    app.put('/user/:userEmail', [isActive, isUser], changePassword)

    // get info of a user TODO limit at the same user? Now is all the users...
    app.get('/user/:userEmail', [isActive, or(_isUser, _isAdmin)], getUserInfo)

    // an ADMIN can block a user
    app.delete('/user/:userEmail', [isActive, isAdmin], blockUser)
}