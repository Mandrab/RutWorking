/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import { sendEmail } from '../../main/controllers/mailer'
import { config as emailConfig } from '../../main/config/email'
import { assert } from 'console'
import { fail } from 'assert'

describe('test emails\' operations', function() {

/**********************************************************************************************************************
    SEND EMAIL
**********************************************************************************************************************/

    it('send', async function() {
        let res1 = await sendEmail(emailConfig.email, "test", "testing sent of emails")

        try {
            await sendEmail('Invalid email format', "test", "testing sent of emails")
            fail('Invalid mail format should not be allowed by nodemailer')
        } catch(err) { }

        assert(res1.accepted.length > 0 && res1.rejected.length === 0, 'That should be a valid call')

        return Promise.resolve()
    })
})