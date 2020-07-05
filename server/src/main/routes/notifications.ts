/**
 * Routes of RESTful API regarding notifications
 * 
 * @author Paolo Baldini
 */
import { isRole, isActive } from '../auths/jwt'
import { _admin } from '../config/firebase'
import { Roles } from '../models'
import { getFirebaseCustomToken } from '../controllers/notifications'

const isUser = isRole(Roles.USER)

module.exports = function (app: any) {
    // get custom token to signin into firebase
    app.get('/firebase/notification', [isActive, isUser], getFirebaseCustomToken)
}