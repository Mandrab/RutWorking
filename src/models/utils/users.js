const jwt = require('jsonwebtoken')
const config = require('../../config/auth.js')
const db = require('../../models')
const User = db.user
const Role = db.role

/**
 * Register a new user to the system
 *
 * @param userID id of the user (must not be yet in db)
 * @param password of the user
 * @param role in the system
 * @param next callback that must accept a structure containing operation code and message
 */
exports.register = (userID, password, role, next) => {
    Role.findOne({ name: role }).then(role => {
        if (!role) return next({ code: 400, msg: 'Role missing or not valid!' })

        User({ username: userID, password: password, role: role._id }).save((err, _) => {
            if (err) return next({ code: 404, msg: 'User already existent!' })
            
            next({ code: 201, msg: 'Successfully registered!' })
        })
    })
}

/**
 * Check if passed token is valid and return binded user
 *
 * @param token the token to check
 * @param next callback that must accept an object containing a field '_id'
 *      or a error code plus an error message
 */
exports.validate = (token, next) => {
    if (!token) return next({ err: 403, msg: 'Token not provided!' })

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) return next({ err: 401, msg: 'Invalid token!' })

        next({ _id: decoded.id })
    })
}

/**
 * Check if user specified by 'id' is an admin
 *
 * @param _id of the user
 * @param next callback that must accept an object that could be a boolean
 *      or a structure specifing error code and message
 */
exports.idOfAdmin = (_id, next) => {
    User.findById(_id, function (err, user) {
        if (err) return next({ err: 404, msg: 'User not found!' })

        userIsAdmin(user, next)
    })
}

/**
 * Check if user is an admin
 *
 * @param user the user model
 * @param next callback that must accept an object that could be a boolean
 *      or a structure specifing error code and message
 */
exports.userIsAdmin = (user, next) => {
    Role.findById(user.role, (err, role) => {
        if (err) return next({ err: 404, msg: 'Role not found!' })

        next(role.name === 'admin')
    })
}