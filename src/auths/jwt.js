const user = require('../models/user.js')
const users = require('../models/utils/users.js')

verifyToken = (request, result, next) => {
    let bToken = request.headers['authorization']
    var token = bToken.split(' ')[1] // Bearer TOKEN

    users.verifyToken(token, res => {
        if (res.err) return result.status(res.err).send(res.msg)

        request.userID = res._id
        next()
    })
}

isAdmin = (request, result, next) => {
    users.isAdmin(request.userID, admin => {
        if (admin.err) return result.status(res.err).send(res.msg)

        next()
    })
}

userOrAdmin = (request, result, next) => {
    user.findById(request.userID, function (_, user) {
        if (!user) return result.status(404).send('User not found!')

        users.userIsAdmin(user, admin => {
            if (admin.err) return result.status(admin.err).send(admin.msg)

            if (!admin && request.params.userID !== user.username)
                return result.status(403).send('Unauthorized')

            next()
        })
    })
}

module.exports = {
    verifyToken,
    isAdmin,
    userOrAdmin
}