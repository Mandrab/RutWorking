const nodemailer = require('nodemailer');
const config = require('../config/email')

const transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.email,
        pass: config.password
    }
})

exports.sendEmail = (address, subject, message, next) => {
    transporter.sendMail({
        from: config.email,
        to: address,
        subject: subject,
        text: message
    }, (err, info) => next(err, info))
}