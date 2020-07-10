/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */
import { isRole, _isRole, _isChief, or, isActive } from '../auths/jwt'
import { newProject, getProjectInfo, deleteProject, getProjects } from '../controllers/project'
import { Roles } from '../models'

const isUser = isRole(Roles.USER)
const _isAdmin = _isRole(Roles.ADMIN)
const _isUser = _isRole(Roles.USER)
const _isProjectChief = _isChief('project')

module.exports = function (app: any) {
    // user can setup a new project
    app.post('/projects/project/:name', [isActive, isUser], newProject)

    // get info of a project
    app.get('/projects/project/:name', [isActive, or(_isUser, _isAdmin)], getProjectInfo)

    // get about projects (max 100)
    app.get('/projects/:skipN?/:user?', [isActive, isUser], getProjects)

    // project chief or admin can block a project
    app.delete('/projects/project/:name', [isActive, or(_isProjectChief, _isAdmin)], deleteProject)
}