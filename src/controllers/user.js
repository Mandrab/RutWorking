const users = require('../models/utils/users.js')

exports.register = (request, result) => {
    users.register(
        request.params.userID,
        request.body.password,
        request.body.role,
        res => { result.status(res.code).send(res.msg) }
    )
}

exports.getUserInfo = (_, result) => {
    result.status(200).send('TODO')
}

exports.blockUser = (_, result) => {
    result.status(200).send('TODO')
}