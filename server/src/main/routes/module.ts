/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */

import { isRole, _isRole, _isChief, or, _isDeveloper, isChief } from '../auths/jwt'
import { newModule, getModuleInfo, endModule, addDeveloper } from '../controllers/module'
import { Roles } from '../models'

const isUser = isRole(Roles.USER)
const _isAdmin = _isRole(Roles.ADMIN)

const isModuleChief = isChief('module')
const _isModuleChief = _isChief('module')
const _isProjectChief = _isChief('project')

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:projectName/modules/:moduleName', [isUser], newModule)

    // get info of a project
    app.get('/projects/:projectName/modules/:moduleName',
        [or(_isAdmin, _isProjectChief, _isModuleChief, _isDeveloper)], getModuleInfo)

    // a chief can add a new developer
    app.post('/projects/:projectName/modules/:moduleName/developers/:userEmail', [isModuleChief], addDeveloper)

    // the project chief or an admin can block a project
    app.delete('/projects/:projectName/modules/:moduleName', [or(_isAdmin, _isModuleChief)], endModule) // TODO
}