const authJwt = require('../auths/jwt')
const controller = require('../controllers/user')

module.exports = function (app) {
    // login a user and get a token
    app.post('/login', controller.login)

    // an ADMIN can register a new user (we are in a corporate context)
    app.post('/user/:userEmail', [authJwt.isAdmin], controller.register)

    // the USER can change his password
    app.put('/user/:userEmail', [authJwt.isUser], controller.changePassword)

    // get info of a user
    app.get('/user/:userEmail', [authJwt.userOrAdmin], controller.getUserInfo)

    // an ADMIN can block a user
    app.delete('/user/:userEmail', [authJwt.userOrAdmin], controller.blockUser)
}