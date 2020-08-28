/**
 * Routes of RESTful API regarding notifications
 * 
 * @author Paolo Baldini
 */
import { isRole, isActive } from '../auths/jwt'
import { _admin } from '../config/firebase'
import { Roles } from '../models'
import { setFirebaseCustomToken } from '../controllers/notifications'

module.exports = function (app: any) {
    // set firebase token to which send notifications
    app.put('/firebase/notification', [
        isActive,
        isRole(Roles.USER)
    ], setFirebaseCustomToken)
}