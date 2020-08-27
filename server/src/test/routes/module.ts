/**
 * Tests module routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import assert from 'assert'
import { connect } from 'mongoose'
import { Roles, Project } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'
import { TestProjectBuilders, TestProject } from '../utils/TestProject'
import { TestUser } from '../utils/TestUser'
import { States } from '../../main/models/db'
import { TestClass } from '../utils/TestClass'
import { equals } from '../utils/Collection'

const request = require('supertest')('http://localhost:8080')

const PROJECTS = TestClass.associativeArray(
    ['post developer', 'delete module', 'get module', 'delete developer'],
    (idx: number) => {
        return TestProjectBuilders.new('project' + idx, `prjchief${idx}@chief.chief`)
            .addModule('module1', `prj${idx}mod1chief@chief.chief`, [
                `prj${idx}mod1dev1@dev.dev`, `prj${idx}mod1dev2@dev.dev`
            ])
            .addModule('module2', `prj${idx}mod2chief@chief.chief`, [`prj${idx}mod2dev@dev.dev`])
            .build()
    }
)
PROJECTS['post module'] = new TestProject(
    'project' + Object.entries(PROJECTS).length,
    new TestUser(`prjchief${Object.entries(PROJECTS).length}@chief.chief`)
)
const USER = new TestUser('user@user.user')

describe('test modules\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all(Object.values(PROJECTS).map(it => it.registerAll()))
        await USER.register(Roles.USER)             // add an initial user
    })

    after(async function() { return clean() })

    var clean = async () => {
        await Promise.all(Object.values(PROJECTS).map(it => it.deleteAll()))
        await USER.delete()
    }

/**********************************************************************************************************************
    MODULE CREATION
**********************************************************************************************************************/

    it('post', async function() {
        let chiefToken = await PROJECTS['post module'].chief.getToken()
        let userToken = await USER.getToken()
        let module1Name = 'module1'
        let module2Name = 'module2'

        // no token
        await request.post('/projects/' + PROJECTS['post module'].name + '/modules/' + module1Name).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECTS['post module'].name + '/modules/' + module1Name)
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECTS['post module'].name + '/modules/' + module1Name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.post('/projects/' + PROJECTS['post module'].name + '/modules/' + module1Name)
            .set({ 'Authorization': chiefToken }).expect(201)

        let project = await Project.findByName(PROJECTS['post module'].name)
        let chief = await PROJECTS['post module'].chief.getUser()
        assert(project.modules().some(it => it.name() === module1Name && equals(it.chiefID(), chief._id())),
            'A module is expected to be added')

        // TODO: OK? -> NO ERROR TRYING TO ADD A NEW MODULE WITH EXISTING NAME

        // valid token and different chief
        await request.post('/projects/' + PROJECTS['post module'].name + '/modules/' + module2Name)
            .set({ 'Authorization': chiefToken }).send({ chief: USER.email }).expect(201)

        await project.refresh()
        let user = await USER.getUser()
        assert(project.modules().some(it => it.name() === module2Name && equals(it.chiefID(), user._id())),
            'A module is expected to be added with a different chief')

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE GET
**********************************************************************************************************************/

    it('get', async function() {
        let projectChiefToken = await PROJECTS['get module'].chief.getToken()
        let moduleChiefToken = await PROJECTS['get module'].modules[0].chief.getToken()
        let developerToken = await PROJECTS['get module'].modules[0].developers[0].getToken()
        let userToken = await USER.getToken()

        // no token
        await request.get('/projects/' + PROJECTS['get module'].name + '/modules/' + PROJECTS['get module'].modules[0]
            .name).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.get('/projects/' + PROJECTS['get module'].name + '/modules/' + PROJECTS['get module'].modules[0]
            .name).set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.get('/projects/FAKE' + PROJECTS['get module'].name + '/modules/' + PROJECTS['get module']
            .modules[0].name).set({ 'Authorization': moduleChiefToken }).expect(404)

        // no module
        await request.get('/projects/' + PROJECTS['get module'].name + '/modules/FAKE' + PROJECTS['get module']
            .modules[0].name).set({ 'Authorization': moduleChiefToken }).expect(404)

        // valid token and project chief
        let response = await request.get('/projects/' + PROJECTS['get module'].name + '/modules/'
            + PROJECTS['get module'].modules[0].name).set({ 'Authorization': projectChiefToken }).expect(200)
            .expect('Content-Type', /json/)
        assert(response.body.name === PROJECTS['get module'].modules[0].name, 'Error retrieving module informations!')

        // valid token and module chief
        response = await request.get('/projects/' + PROJECTS['get module'].name + '/modules/'
            + PROJECTS['get module'].modules[0].name).set({ 'Authorization': moduleChiefToken }).expect(200)
            .expect('Content-Type', /json/)
        assert(response.body.name === PROJECTS['get module'].modules[0].name, 'Error retrieving module informations!')

        // valid token and non-developer user
        await request.get('/projects/' + PROJECTS['get module'].name + '/modules/' + PROJECTS['get module'].modules[0]
            .name).set({ 'Authorization': userToken }).expect(403)

        // valid token and developer
        response = await request.get('/projects/' + PROJECTS['get module'].name + '/modules/' + PROJECTS['get module']
            .modules[0].name).set({ 'Authorization': developerToken }).expect(200).expect('Content-Type', /json/)
        assert(response.body.name === PROJECTS['get module'].modules[0].name, 'Error retrieving module informations!')

        assert(response.body.developers.length >= 1, 'Error retrieving module informations!')
        assert(response.body.developers !== PROJECTS['get module'].modules[0].developers,
            'Error retrieving module informations!')

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE DELETION
**********************************************************************************************************************/

    it('delete', async function() {
        let projectChiefToken = await PROJECTS['delete module'].chief.getToken()
        let moduleChiefToken = await PROJECTS['delete module'].modules[0].chief.getToken()
        let userToken = await USER.getToken()

        // no token
        await request.delete('/projects/' + PROJECTS['delete module'].name + '/modules/' + PROJECTS['delete module']
            .modules[0].name).expect(500).expect('Token has not been passed!')

        // user token (not chief)
        await request.delete('/projects/' + PROJECTS['delete module'].name + '/modules/' + PROJECTS['delete module']
            .modules[0].name).set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.delete('/projects/FAKE' + PROJECTS['delete module'].name + '/modules/'
            + PROJECTS['delete module'].modules[0].name).set({ 'Authorization': projectChiefToken }).expect(404)

        await request.delete('/projects/' + PROJECTS['delete module'].name + '/modules/FAKE'
            + PROJECTS['delete module'].modules[0].name).set({ 'Authorization': projectChiefToken }).expect(404)

        // valid token
        await request.delete('/projects/' + PROJECTS['delete module'].name + '/modules/' + PROJECTS['delete module']
            .modules[0].name).set({ 'Authorization': moduleChiefToken }).expect(200)
        
        // valid token
        await request.delete('/projects/' + PROJECTS['delete module'].name + '/modules/' + PROJECTS['delete module']
            .modules[1].name).set({ 'Authorization': projectChiefToken }).expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE POST DEVELOPER
**********************************************************************************************************************/

    it('post developer', async function() {
        let projectChiefToken = await PROJECTS['post developer'].chief.getToken()
        let moduleChiefToken = await PROJECTS['post developer'].modules[0].chief.getToken()
        let userToken = await USER.getToken()

        // no token
        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/' + PROJECTS['post developer']
            .modules[0].name + '/developers/' + USER.email).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/' + PROJECTS['post developer']
            .modules[0].name + '/developers/' + USER.email).set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.post('/projects/FAKE' + PROJECTS['post developer'].name + '/modules/'
            + PROJECTS['post developer'].modules[0].name + '/developers/' + USER.email)
            .set({ 'Authorization': moduleChiefToken }).expect(404)

        // no module
        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/FAKE'
            + PROJECTS['post developer'].modules[0].name + '/developers/' + USER.email)
            .set({ 'Authorization': moduleChiefToken }).expect(404)

        // valid token but user
        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/' + PROJECTS['post developer']
            .modules[0].name + '/developers/' + USER.email).set({ 'Authorization': userToken }).expect(403)

        // valid token but project chief
        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/' + PROJECTS['post developer']
            .modules[0].name + '/developers/' + USER.email).set({ 'Authorization': projectChiefToken }).expect(403)

        // valid token and module chief
        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/' + PROJECTS['post developer']
            .modules[0].name + '/developers/' + USER.email).set({ 'Authorization': moduleChiefToken }).expect(200)

        await request.post('/projects/' + PROJECTS['post developer'].name + '/modules/' + PROJECTS['post developer']
            .modules[0].name + '/developers/' + USER.email).set({ 'Authorization': moduleChiefToken }).expect(200)
        
        let project = await Project.findByName(PROJECTS['post developer'].name)
        let module = project.modules().find(it => it.name() === PROJECTS['post developer'].modules[0].name)

        let user = await USER.getUser()
        assert(module.developersIDs().length === 3, 'Wrong number of developers!')
        assert(module.developersIDs().some(it => equals(it, user._id())), 'Unexpected developer!')

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE DELETE DEVELOPER
**********************************************************************************************************************/

    it('delete developer', async function() {
        let projectChiefToken = await PROJECTS['delete developer'].chief.getToken()
        let moduleChiefToken = await PROJECTS['delete developer'].modules[0].chief.getToken()
        let developer = await PROJECTS['delete developer'].modules[0].developers[0].getUser()
        let userToken = await USER.getToken()

        let project = await Project.findByName(PROJECTS['delete developer'].name)
        let module = project.modules().find(it => it.name() === PROJECTS['delete developer'].modules[0].name)
        await module.newTask('x', 'x', States.IN_PROGRESS, developer)
        await module.newTask('y', 'y', States.DONE, developer)

        // no token
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email()).expect(500)
            .expect('Token has not been passed!')

        // invalid token
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email())
            .set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.delete('/projects/FAKE' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email())
            .set({ 'Authorization': moduleChiefToken }).expect(404)

        // no module
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/FAKE'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email())
            .set({ 'Authorization': moduleChiefToken }).expect(404)

        // no user
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/FAKE' + developer.email())
            .set({ 'Authorization': moduleChiefToken }).expect(404)

        // valid token but user
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email())
            .set({ 'Authorization': userToken }).expect(403)

        // valid token but project chief
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email())
            .set({ 'Authorization': projectChiefToken }).expect(403)

        // valid token and module chief
        await request.delete('/projects/' + PROJECTS['delete developer'].name + '/modules/'
            + PROJECTS['delete developer'].modules[0].name + '/developers/' + developer.email())
            .set({ 'Authorization': moduleChiefToken }).expect(200)

        await module.refresh()

        assert(module.developersIDs().length === 1, 'Wrong number of developers!')
        assert(module.kanbanItems().length === 2, 'Wrong number of tasks!')
        assert(module.kanbanItems().some(it => it.status() === States.DONE)
            || module.kanbanItems().some(it => it.status() === States.TODO), 'Wrong tasks states!')

        return Promise.resolve()
    })
})