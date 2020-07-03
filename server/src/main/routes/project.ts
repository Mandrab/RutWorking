/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */

import { isRole, _isRole, _isChief, or } from '../auths/jwt'
import { newProject, getProjectInfo, blockProject, getProjects } from '../controllers/project'
import { Roles } from '../models'

const isUser = isRole(Roles.USER)
const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)
const _isProjectChief = _isChief('project')

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:name', [isUser], newProject)

    // get about projects (max 100)
    app.get('/projects', [isUser], getProjects)

    // get info of a project
    app.get('/projects/:name', [or(_isUser, _isAdmin)], getProjectInfo)

    // the project chief or an admin can block a project
    app.delete('/projects/:name', [or(_isProjectChief, _isAdmin)], blockProject)
}