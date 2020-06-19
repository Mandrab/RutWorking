const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const config = require('../../config/auth.js')
const users = require('../../models/user.js')
const db = require('../../models')
const User = db.user
const Role = db.role

db.mongoose.set('useFindAndModify', false);

/**
 * Log the user and get a token for him
 *
 * @param userEmail mail of the user
 * @param password of the user
 * @param next callback that must accept an object containing a field 'accessToken'
 *      or a error code plus an error message
 */
exports.login = (userEmail, password, next) => {
    User.findOne({ userEmail: userEmail }, function(err, user) {
        if (err) return next({ err: 500, msg: 'Internal error has occurred!' })

        if (!user) return next({ err: 404, msg: 'Unable to login!' })

        var passwordIsValid = bcrypt.compareSync(password, user.password)
        if (!passwordIsValid) return next({ err: 401, msg: 'Unable to login!' })

        next({ accessToken: jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 }) }) // 24 hours
    })
}

/**
 * Register a new user to the system
 *
 * @param userEmail email of the user (must not be yet in db)
 * @param password of the user
 * @param role in the system
 * @param next callback that must accept a structure containing operation code and message
 */
exports.register = (userEmail, password, role, next) => {
    Role.findOne({ name: role }).then(role => {
        if (!role) return next({ code: 400, msg: 'Role missing or not valid!' })

        User({ userEmail: userEmail, password: password, role: role._id }).save((err, _) => {
            if (err) return next({ code: 404, msg: 'User already existent!' })

            next({ code: 201, msg: 'Successfully registered!' })
        })
    })
}

exports.changePassword = (userEmail, oldPassword, newPassword, next) => {
    User.findOne({ userEmail: userEmail }, function (err, user) {
        bcrypt.compare(oldPassword, user.password, function(err, res) {
            if (res) { // Password matched
                bcrypt.genSalt(users.SALT_WORK_FACTOR, function(err, salt) {
                    if (err) throw err

                    // hash the password using our new salt
                    bcrypt.hash(newPassword, salt, function(err, hash) {
                        if (err) throw err

                        // override the cleartext password with the hashed one
                        User.findOneAndUpdate({ userEmail: userEmail }, { password: hash }, function (err, _) {
                            if (err) return next(false)
                            return next(true)
                        })
                    })
                })
            } else return next(false)
        })
    })
    User.findOneAndUpdate({ userEmail: userEmail }, { password: newPassword })
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
 * Check if two users are the same.
 * Used to check that the user to which the token belong is
 * the same on which apply the action
 *
 * @param _id of the user in DB
 * @param userEmail email to check
 * @param next callback that must accept an object that could be a boolean
 *      or a structure specifing error code and message
 */
exports.isUser = (_id, userEmail, next) => {
    User.findById(_id, (err, user) => {
        if (err) return next({ err: 404, msg: 'User not found!' })

        next(user.userEmail === userEmail)
    })
}

/**
 * Check if user is an admin
 *
 * @param _id of the user in the model
 * @param next callback that must accept an object that could be a boolean
 *      or a structure specifing error code and message
 */
exports.isAdmin = (_id, next) => {
    User.findById(_id, (_, user) => {
        Role.findById(user.role, (_, role) => {
            if (!role) return next({ err: 404, msg: 'Role not found!' })

            next(role.name === 'admin')
        })
    })
}