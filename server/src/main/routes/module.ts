/**
 * Routes of RESTful API regarding modules
 * 
 * @author Paolo Baldini
 */
import { _isRole, _isChief, or, _isDeveloper, isChief, isActive } from '../auths/jwt'
import { newModule, getModuleInfo, deleteModule, addDeveloper, removeDeveloper } from '../controllers/module'

const isProjectChief = isChief('project')
const isModuleChief = isChief('module')

const _isModuleChief = _isChief('module')
const _isProjectChief = _isChief('project')

module.exports = function (app: any) {
    // project-chief (check inside) can create a module to work on
    app.post('/projects/:projectName/modules/:moduleName', [
        isActive,
        isProjectChief
    ], newModule)

    // get info of a module
    app.get('/projects/:projectName/modules/:moduleName', [
        isActive,
        or(_isProjectChief, _isModuleChief, _isDeveloper)
    ], getModuleInfo)

    // chief can add a new developer
    app.post('/projects/:projectName/modules/:moduleName/developers/:userEmail', [
        isActive,
        isModuleChief
    ], addDeveloper)

    // the project chief or an admin can delete a project
    app.delete('/projects/:projectName/modules/:moduleName', [
        isActive,
        or(_isProjectChief, _isModuleChief)
    ], deleteModule)

    // the project chief or an admin can remove a developer
    app.delete('/projects/:projectName/modules/:moduleName/developers/:developerEmail', [
        isActive,
        isModuleChief
    ], removeDeveloper)
}