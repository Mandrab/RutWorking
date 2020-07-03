/**
 * Routes of RESTful API regarding chats
 * 
 * @author Paolo Baldini
 */
import { _isDeveloper, _isChief, or } from '../auths/jwt'
import { newTask, getTasks, updateStatus } from '../controllers/kanban'

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:projectName/modules/:moduleName/kanban', [or(_isChief)], newTask)

    // get info of a project
    app.put('/projects/:projectName/modules/:moduleName/kanban/:taskID', [or(_isDeveloper, _isChief)], updateStatus)

    // get info of a project
    app.get('/projects/:projectName/modules/:moduleName/kanban', [or(_isDeveloper, _isChief)], getTasks)
}