/**
 * Groups interesting model entities and related
 *
 * @author Paolo Baldini
 */
export { User } from './user'
export { login, register } from './utils/users'

export { Role, Roles } from './role'

export { State, States } from './status'

export { Project } from './project'
export { newProject, getProjects, getProjectInfo } from './utils/projects'

export { Module } from './module'
export {
    newModule,
    getModuleInfo,
    addDeveloper,
    removeDeveloper,
    getTasks,
    getMessages
} from './utils/modules'