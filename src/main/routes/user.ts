/**
 * Routes of RESTful API regarding users
 * 
 * @author Paolo Baldini
 */
import { isActive, isUser, isAdmin, isUserOrAdmin } from '../auths/jwt'
import { login, register, blockUser, changePassword, getUserInfo } from '../controllers/user'

module.exports = function (app: any) {
    // login a user and get a token
    app.post('/login', login)

    // an ADMIN can register a new user (we are in a corporate context)
    app.post('/user/:userEmail', [isActive, isAdmin], register)

    // the USER can change his password
    app.put('/user/:userEmail', [isActive, isUser], changePassword)

    // get info of a user
    app.get('/user/:userEmail', [isActive, isUserOrAdmin], getUserInfo)

    // an ADMIN can block a user
    app.delete('/user/:userEmail', [isActive, isAdmin], blockUser)
}