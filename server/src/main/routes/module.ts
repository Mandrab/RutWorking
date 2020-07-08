/**
 * Routes of RESTful API regarding modules
 * 
 * @author Paolo Baldini
 */
import { isRole, _isRole, _isChief, or, _isDeveloper, isChief, isActive } from '../auths/jwt'
import { newModule, getModuleInfo, endModule, addDeveloper } from '../controllers/module'
import { Roles } from '../models'

const _isAdmin = _isRole(Roles.ADMIN)

const _isModuleChief = _isChief('module')
const _isProjectChief = _isChief('project')

module.exports = function (app: any) {
    // project-chief (check inside) can create a module to work on
    app.post('/projects/:projectName/modules/:moduleName', [
        isActive,
        isRole(Roles.USER)
    ], newModule)

    // get info of a module
    app.get('/projects/:projectName/modules/:moduleName', [
        isActive,
        or(_isAdmin, _isProjectChief, _isModuleChief, _isDeveloper)
    ], getModuleInfo)

    // chief can add a new developer
    app.post('/projects/:projectName/modules/:moduleName/developers/:userEmail', [
        isActive,
        isChief('module')
    ], addDeveloper)

    // the project chief or an admin can block a project
    app.delete('/projects/:projectName/modules/:moduleName', [
        isActive,
        or(_isAdmin, _isModuleChief)
    ], endModule) // TODO
}