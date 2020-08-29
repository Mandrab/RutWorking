/**
 * Routes of RESTful API regarding notifications
 * 
 * @author Paolo Baldini
 */
import { isActive, isRole, or, _isRole } from '../auths/jwt'
import { _admin } from '../config/firebase'
import { Roles } from '../models'
import { setFirebaseCustomToken } from '../controllers/notifications'
import { getUserNotifications } from '../controllers/user'

const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)

module.exports = function (app: any) {
    // set firebase token to which send notifications
    app.put('/firebase/notification', [
        isActive,
        isRole(Roles.USER)
    ], setFirebaseCustomToken)

    // get info of a user
    app.get('/notifications', [isActive, or(_isAdmin, _isUser)], getUserNotifications)
}