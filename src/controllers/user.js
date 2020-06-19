const users = require('../models/utils/users.js')
const communication = require('./communication.js')

exports.login = (request, result) => {
    users.login(
        request.body.userEmail,
        request.body.password,
        token => {
            if (token.err) return result.status(token.err).send(token.msg)

            result.status(200).send({ accessToken: token.accessToken }) // 24 hours
        }
    )
}

exports.register = (request, result) => {
    if (!request.body.role) return result.status(400).send('Role missing in body!')

    let password = Math.random().toString(36).substring(2)
    users.register(
        request.params.userEmail,
        password,
        request.body.role,
        res => {
            communication.sendEmail(request.params.userEmail, 'Registration', password, (_1,_2) => {})
            result.status(res.code).send(res.msg)
            console.log('Generated password: ' + password) // TODO remove.. only to debug
        }
    )
}

exports.changePassword = (request, result) => {
    if (!request.body.oldPassword || !request.body.newPassword) return result.status(400).send('Info missing in body!')

    users.changePassword(request.params.userEmail, request.body.oldPassword, request.body.newPassword, succeded => {
        if (!succeded) return result.status(401).send('Invalid password!')
        result.status(200).send('Successfully updated!')
    })
}

exports.getUserInfo = (_, result) => {
    result.status(200).send('TODO')
}

exports.blockUser = (_, result) => {
    result.status(200).send('TODO')
}