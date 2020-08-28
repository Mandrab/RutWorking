/**
 * Utilities function to send emails
 * TODO not yet tested
 *
 * @author Paolo Baldini
 */
import { createTransport } from 'nodemailer'
import { config as emailConfig } from '../config/email'

const transporter = createTransport({
    service: emailConfig.service,
    auth: {
        user: emailConfig.email,
        pass: emailConfig.password
    }
})

/**
 * Send mail with specified params and run the callback
 * 
 * @param address email address to which send the mail
 * @param subject subject of the email
 * @param message body of the email
 */
export async function sendEmail(address: string, subject: string, message: string) {
    return transporter.sendMail({
        from: emailConfig.email,
        to: address,
        subject: subject,
        text: message
    })
}