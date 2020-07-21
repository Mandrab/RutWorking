/**
 * Routes of RESTful API regarding modules' chats
 * 
 * @author Paolo Baldini
 */
import { _isDeveloper, _isChief, or, isActive } from '../auths/jwt'
import { newMessage, getMessages } from '../controllers/chat'

const _isProjectChief = _isChief('project')
const _isModuleChief = _isChief('module')

module.exports = function (app: any) {
    // send a message in the chat
    app.post('/projects/:projectName/modules/:moduleName/messages', [
        isActive,
        or(_isProjectChief, _isModuleChief, _isDeveloper)
    ], newMessage)

    // get first 100 chat messages TODO last?
    app.get('/projects/:projectName/modules/:moduleName/messages/:skipN?', [
        isActive,
        or(_isProjectChief, _isModuleChief, _isDeveloper)
    ], getMessages)
}