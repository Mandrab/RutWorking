/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */

import { isRole, _isRole, _isChief, or } from '../auths/jwt'
import { newProject, getProjectInfo, blockProject } from '../controllers/project'
import { Roles } from '../models'

const isUser = isRole(Roles.USER)
const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:name', [isUser], newProject)

    // get info of a project
    app.get('/projects/:name', [or(_isUser, _isAdmin)], getProjectInfo)

    // the project chief or an admin can block a project
    app.delete('/projects/:name', [or(_isChief, _isAdmin)], blockProject)
}