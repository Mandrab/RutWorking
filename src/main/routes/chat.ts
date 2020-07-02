/**
 * Routes of RESTful API regarding chats
 * 
 * @author Paolo Baldini
 */
import { _isDeveloper, _isChief, or } from '../auths/jwt'
import { newMessage, getMessages } from '../controllers/chat'

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:projectName/modules/:moduleName/messages', [or(_isDeveloper, _isChief)], newMessage)

    // get info of a project
    app.get('/projects/:projectName/modules/:moduleName', [or(_isDeveloper, _isChief)], getMessages)
}