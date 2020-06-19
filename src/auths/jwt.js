const user = require('../models/user.js')
const users = require('../models/utils/users.js')

exports.validate = (request, result, next) => {
    let bToken = request.headers['authorization']
    var token = bToken.split(' ')[1] // Bearer TOKEN

    users.validate(token, res => {
        if (res.err) return result.status(res.err).send(res.msg)

        request.userID = res._id
        next()
    })
}

exports.isUser = (request, result, next) => {
    this.validate(request, result, () => {
        users.isUser(request.userID, request.params.userEmail, user => {
            if (user.err) return result.status(user.err).send(user.msg)

            next()
        })
    })
}

exports.isAdmin = (request, result, next) => {
    this.validate(request, result, () => {
        users.isAdmin(request.userID, admin => {
            if (admin.err) return result.status(admin.err).send(admin.msg)

            next()
        })
    })
}

exports.userOrAdmin = (request, result, next) => {
    this.validate(request, result, () => {
        user.findById(request.userEmail, function (_, user) {
            if (!user) return result.status(404).send('User not found!')

            users.isAdmin(user._id, admin => {
                if (admin.err) return result.status(admin.err).send(admin.msg)

                if (!admin && request.params.userEmail !== user.userEmail)
                    return result.status(403).send('Unauthorized')

                next()
            })
        })
    })
}