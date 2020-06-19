/**
 * Utilities function to send emails
 * TODO not yet tested
 *
 * @author Paolo Baldini
 */

const nodemailer = require('nodemailer');
const config = require('../config/email')

const transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.email,
        pass: config.password
    }
})

/**
 * Send mail with specified params and run the callback
 * 
 * @param address email address to which send the mail
 * @param subject subject of the email
 * @param message body of the email
 * @param next callback
 */
exports.sendEmail = (address, subject, message, next) => {
    transporter.sendMail({
        from: config.email,
        to: address,
        subject: subject,
        text: message
    }, (err, info) => next(err, info))
}