const users = require('../models/utils/users.js')

exports.register = (request, result) => {
    users.register(
        request.params.userID,
        request.body.password,
        request.body.role,
        res => { result.status(res.code).send(res.msg) }
    )
}

exports.login = (request, result) => {
    users.login(
        request.body.username,
        request.body.password,
        token => {
            if (token.err) return result.status(token.err).send(token.msg)

            result.status(200).send({
                username: request.body.username,
                accessToken: token.accessToken // 24 hours
            })
        }
    )
}

exports.getUserInfo = (_, result) => {
    result.status(200).send('TODO')
}

exports.blockUser = (_, result) => {
    result.status(200).send('TODO')
}