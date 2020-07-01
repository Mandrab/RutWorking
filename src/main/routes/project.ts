/**
 * Routes of RESTful API regarding projects
 * 
 * @author Paolo Baldini
 */

import { isUser, isUserOrAdmin, isChiefOrAdmin } from '../auths/jwt'
import { newProject, getProjectInfo, blockProject } from '../controllers/project'

module.exports = function (app: any) {
    // a user can setup a new project
    app.post('/projects/:name', [isUser], newProject)

    // get info of a project
    app.get('/projects/:name', [isUserOrAdmin], getProjectInfo)

    // the project chief or an admin can block a project
    app.delete('/projects/:name', [isChiefOrAdmin], blockProject)
}