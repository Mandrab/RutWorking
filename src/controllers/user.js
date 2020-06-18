const User = require('../models/user')
const Role = require('../models/role')

exports.register = (userID, password, role, result) => {
    Role.findOne({ role: role }).then(role => {
        if (!role) result.status(400).send('Role missing or not valid!')

        User({
            username: userID,
            password: password,
            role: role._id
        }).save((err, _) => {
            if (err) result.status(404).send('User already existent!')
            else result.status(201).send('Successfully registered!')
        })
    })
}

exports.allAccess = (_, res) => {
    res.status(200).send("Public Content.");
}

exports.userBoard = (_, res) => {
    res.status(200).send("User Content.");
}

exports.adminBoard = (_, res) => {
    res.status(200).send("Admin Content.");
}

exports.moderatorBoard = (_, res) => {
    res.status(200).send("Moderator Content.");
}