/**
 * Routes of RESTful API regarding modules' kanbans
 * 
 * @author Paolo Baldini
 */
import { _isDeveloper, _isChief, or, isActive, isChief } from '../auths/jwt'
import { newTask, getTasks, updateStatus } from '../controllers/kanban'

const isModuleChief = isChief('module')
const _isProjectChief = _isChief('project')
const _isModuleChief = _isChief('module')

module.exports = function (app: any) {
    // chief can publish new task to be accomplished
    app.post('/projects/:projectName/modules/:moduleName/kanban', [
        isActive,
        isModuleChief
    ], newTask)

    // add assignee or update task state in kanban
    app.put('/projects/:projectName/modules/:moduleName/kanban/:taskID', [
        isActive,
        or(_isModuleChief, _isDeveloper)
    ], updateStatus)

    // get first 100 kanban's tasks. user and skipN can be used 
    app.get('/projects/:projectName/modules/:moduleName/kanban/:skipN?/:user?', [
        isActive,
        or(_isProjectChief, _isModuleChief, _isDeveloper)
    ], getTasks)
}