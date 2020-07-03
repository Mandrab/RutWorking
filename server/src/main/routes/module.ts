/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */

import { isRole, _isRole, _isChief, or } from '../auths/jwt'
import { newModule, getModuleInfo, endModule } from '../controllers/module'
import { Roles } from '../models'

const isUser = isRole(Roles.USER)
const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:projectName/modules/:moduleName', [isUser], newModule)

    // get info of a project
    app.get('/projects/:projectName/modules/:moduleName', [or(_isUser, _isAdmin)], getModuleInfo)

    // the project chief or an admin can block a project
    app.delete('/projects/:projectName/modules/:moduleName', [or(_isAdmin, _isChief)], endModule)
}