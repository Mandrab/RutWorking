/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */

import { isUser, isUserOrAdmin, isChiefOrAdmin } from '../auths/jwt'
import { newModule, getModuleInfo, endModule } from '../controllers/module'

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:projectName/modules/:moduleName', [isUser], newModule)

    // get info of a project
    app.get('/projects/:projectName/modules/:moduleName', [isUserOrAdmin], getModuleInfo)

    // the project chief or an admin can block a project
    app.delete('/projects/:projectName/modules/:moduleName', [isChiefOrAdmin], endModule)
}