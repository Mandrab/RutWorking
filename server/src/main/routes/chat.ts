/**
 * Routes of RESTful API regarding chats
 * 
 * @author Paolo Baldini
 */
import { _isDeveloper, _isChief, or } from '../auths/jwt'
import { newMessage, getMessages } from '../controllers/chat'

const _isModuleChief = _isChief('module')

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:projectName/modules/:moduleName/messages', [or(_isDeveloper, _isModuleChief)], newMessage)

    // get info of a project
    app.get('/projects/:projectName/modules/:moduleName/messages', [or(_isDeveloper, _isModuleChief)], getMessages)
}