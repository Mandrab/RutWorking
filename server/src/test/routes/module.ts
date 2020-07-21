/**
 * Tests project routes
 * 
 * @author Paolo Baldini
 */
import { connect } from "mongoose"
import { register, Roles, User, Project, newModule, addDeveloper } from "../../main/models"
import { DBUser, DBProject, States } from "../../main/models/db"
import { config as dbConfig } from '../../main/config/db'
import { sign } from "jsonwebtoken"
import { secret } from "../../main/config/auth"

const request = require('supertest')('http://localhost:8080')

const PROJECTS = [
    {
        chief: {
            email: 'pchief1@chief.chief'
        },
        name: 'project',
        modules: [{
            name: 'module1',
            chief: {
                email: 'mchiefp11@chief.chief'
            },
            developers: [ 'gianni' ]
        }, {
            name: 'module2',
            chief: {
                email: 'mchiefp12@chief.chief'
            },
            developers: [ 'solimano' ]
        }]
    }, {
        chief: {
            email: 'pchief2@chief.chief'
        },
        name: 'project2',
        modules: [{
            name: 'module1',
            chief: {
                email: 'mchief2@chief.chief'
            },
            developers: [ 'antonio', 'costantino' ]
        }]
    }, {
        chief: {
            email: 'pchief3@chief.chief'
        },
        name: 'project3',
        modules: [{
            name: 'module1',
            chief: {
                email: 'mchief3@chief.chief'
            },
            developers: []
        }]
    },  {
        chief: {
            email: 'pchief4@chief.chief'
        },
        name: 'project4',
        modules: [{
            name: 'module1',
            chief: {
                email: 'mchief4@chief.chief'
            },
            developers: []
        }]
    }
]
const USER = {
    email: 'user@user.user'
}

describe('test modules\' operations', function() {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await Promise.all([
            await Promise.all(PROJECTS.map(async project => {
                // add an initial project chief
                await register('x', 'y', project.chief.email, 'z', Roles.USER)

                // add an initial module chief
                await Promise.all(project.modules.map(async module => {
                    await register('x', 'y', module.chief.email, 'z', Roles.USER)

                    // add an initial developers
                    await Promise.all(module.developers.map(async developer => {
                        await register('x', 'y', developer, 'z', Roles.USER)
                    }))
                }))
            })),
            // add an initial user
            register('x', 'y', USER.email, 'z', Roles.USER)
        ])
    })

    after(async function() { return clean() })

    var clean = async () => {
        await Promise.all(PROJECTS.map(async project => {
            // delete project chief
            try { await DBUser.deleteOne({ email: project.chief.email }) } catch (_) { }

            // delete project modules
            await Promise.all(project.modules.map(async module => {
                // delete module chief
                try { await DBUser.deleteOne({ email: module.chief.email }) } catch (_) { }

                // delete module developers
                await Promise.all(module.developers.map(async developer => {
                    try { await DBUser.deleteOne({ email: developer }) } catch (_) { }
                }))
            }))

            // delete project
            try { await DBProject.deleteOne({ name: project.name }) } catch (_) { }
        }))
        // delete user
        try { await DBUser.deleteOne({ email: USER.email }) } catch (_) { }
    }

/**********************************************************************************************************************
    MODULE CREATION
**********************************************************************************************************************/

    it('test module creation', async function() {
        let chief = await User.findByEmail(PROJECTS[0].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        await new DBProject({ name: PROJECTS[0].name, chief: chief._id(), modules: [] }).save()

        // no token
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name)
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.post('/projects/FAKE' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(201)

        let project = await Project.findByName(PROJECTS[0].name)
        if (!project.modules().some(it => it.name() === PROJECTS[0].modules[0].name
                && it.chiefID().toString() === chief._id().toString()))
            throw 'A module is expected to be added'

        // TODO: OK? -> NO ERROR TRYING TO ADD A NEW MODULE WITH EXISTING NAME

        // valid token and different chief
        await request.post('/projects/' + PROJECTS[0].name + '/modules/' + PROJECTS[0].modules[1].name)
            .set({ 'Authorization': chiefToken }).send({ chief: USER.email }).expect(201)

        await project.refresh()
        if (!project.modules().some(it => it.name() === PROJECTS[0].modules[1].name
            && it.chiefID().toString() === user._id().toString()))
            throw 'A module is expected to be added with a different chief'

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE DELETION
**********************************************************************************************************************/

    it('test module deletion', async function() {
        let chief = await User.findByEmail(PROJECTS[0].chief.email)
        let chiefToken = sign({ id: chief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        let moduleName = "auth"
        try { await new DBProject({ name: PROJECTS[0].name, chief: chief._id(), modules: [] }).save() } catch (_) { }
        let project = await Project.findByName(PROJECTS[0].name)
        project.newModule(moduleName, chief._id())

        // no token
        await request.delete('/projects/' + PROJECTS[0].name + '/modules/' + moduleName).expect(500)
            .expect('Token has not been passed!')

        // user token (not chief)
        await request.delete('/projects/' + PROJECTS[0].name + '/modules/' + moduleName)
            .set({ 'Authorization': userToken }).expect(403)

        // no project
        await request.delete('/projects/FAKE' + PROJECTS[0].name + '/modules/' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(404)

        await request.delete('/projects/' + PROJECTS[0].name + '/modules/FAKE' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token
        await request.delete('/projects/' + PROJECTS[0].name + '/modules/' + moduleName)
            .set({ 'Authorization': chiefToken }).expect(200)

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE POST DEVELOPER
**********************************************************************************************************************/

    it('post developer', async function() {
        let projectChief = await User.findByEmail(PROJECTS[2].chief.email)
        let projectChiefToken = sign({ id: projectChief._id() }, secret, { expiresIn: 86400 })
        let moduleChief = await User.findByEmail(PROJECTS[2].modules[0].chief.email)
        let chiefToken = sign({ id: moduleChief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        try {
            await new DBProject({ name: PROJECTS[2].name, chief: projectChief._id(), modules: [] }).save()
        } catch (_) {}
        await newModule(PROJECTS[2].modules[0].name, moduleChief._id(), PROJECTS[2].name)

        // no token
        await request.post('/projects/' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.post('/projects/' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.post('/projects/FAKE' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.post('/projects/' + PROJECTS[2].name + '/modules/FAKE' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(404)

        // valid token but user
        await request.post('/projects/' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': userToken }).expect(403)

        // valid token but project chief
        await request.post('/projects/' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': projectChiefToken }).expect(403)

        // valid token and module chief
        await request.post('/projects/' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(200)

        await request.post('/projects/' + PROJECTS[2].name + '/modules/' + PROJECTS[2].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(200)
        
        let project = await Project.findByName(PROJECTS[2].name)
        let module = project.modules().find(it => it.name() === PROJECTS[2].modules[0].name)

        if (module.developersIDs().length !== 1) throw 'Wrong number of developers!'
        if (!module.developersIDs().some(it => it.toString() === user._id().toString())) throw 'Unexpected developer!'

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE GET
**********************************************************************************************************************/

    it('get', async function() {
        let projectChief = await User.findByEmail(PROJECTS[1].chief.email)
        let projectChiefToken = sign({ id: projectChief._id() }, secret, { expiresIn: 86400 })
        let moduleChief = await User.findByEmail(PROJECTS[1].modules[0].chief.email)
        let chiefToken = sign({ id: moduleChief._id() }, secret, { expiresIn: 86400 })
        let developer = await User.findByEmail(PROJECTS[1].modules[0].developers[0])
        let developerToken = sign({ id: developer._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        try {
            await new DBProject({ name: PROJECTS[1].name, chief: projectChief._id(), modules: [] }).save()
        } catch (_) {}
        await newModule(PROJECTS[1].modules[0].name, moduleChief._id(), PROJECTS[1].name)
        await addDeveloper(PROJECTS[1].name, PROJECTS[1].modules[0].name, PROJECTS[1].modules[0].developers[0])
        await addDeveloper(PROJECTS[1].name, PROJECTS[1].modules[0].name, PROJECTS[1].modules[0].developers[1])

        // no token
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name).expect(500)
            .expect('Token has not been passed!')

        // invalid token
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.get('/projects/FAKE' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.get('/projects/' + PROJECTS[1].name + '/modules/FAKE' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(404)

        // valid token and project chief
        let response = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': projectChiefToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[1].modules[0].name) throw 'Error retrieving module informations!'

        // valid token and module chief
        response = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': chiefToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[1].modules[0].name) throw 'Error retrieving module informations!'

        // valid token and non-developer user
        await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': userToken }).expect(403)

        // valid token and developer
        response = await request.get('/projects/' + PROJECTS[1].name + '/modules/' + PROJECTS[1].modules[0].name)
            .set({ 'Authorization': developerToken }).expect(200).expect('Content-Type', /json/)
        if (response.body.name !== PROJECTS[1].modules[0].name) throw 'Error retrieving module informations!'

        if (response.body.developers.length < 1) throw 'Error retrieving module informations!'
        if (response.body.developers === PROJECTS[1].modules[0].developers) throw 'Error retrieving module informations!'

        return Promise.resolve()
    })

/**********************************************************************************************************************
    MODULE DELETE DEVELOPER
**********************************************************************************************************************/

    it('delete developer', async function() {
        let projectChief = await User.findByEmail(PROJECTS[3].chief.email)
        let projectChiefToken = sign({ id: projectChief._id() }, secret, { expiresIn: 86400 })
        let moduleChief = await User.findByEmail(PROJECTS[3].modules[0].chief.email)
        let chiefToken = sign({ id: moduleChief._id() }, secret, { expiresIn: 86400 })
        let user = await User.findByEmail(USER.email)
        let userToken = sign({ id: user._id() }, secret, { expiresIn: 86400 })

        try {
            await new DBProject({ name: PROJECTS[3].name, chief: projectChief._id(), modules: [] }).save()
        } catch (_) {}
        await newModule(PROJECTS[3].modules[0].name, moduleChief._id(), PROJECTS[3].name)
        let project = await Project.findByName(PROJECTS[3].name)
        let module = project.modules().find(it => it.name() === PROJECTS[3].modules[0].name)
        await module.addDeveloper(user._id())
        await module.newTask('x')
        await module.newTask('y')
        await module.refresh()

        let task1 = module.kanbanItems()[0]
        let task2 = module.kanbanItems()[1]
        module.updateTaskStatus(task1._id(), States.IN_PROGRESS, user._id())
        module.updateTaskStatus(task2._id(), States.DONE, user._id())

        // no token
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).expect(500).expect('Token has not been passed!')

        // invalid token
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': 'john' }).expect(401)

        // no project
        await request.delete('/projects/FAKE' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(404)

        // no module
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/FAKE' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(404)

        // no user
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/FAKE' + user.email()).set({ 'Authorization': chiefToken }).expect(404)

        // valid token but user
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': userToken }).expect(403)

        // valid token but project chief
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': projectChiefToken }).expect(403)

        // valid token and module chief
        await request.delete('/projects/' + PROJECTS[3].name + '/modules/' + PROJECTS[3].modules[0].name +
            '/developers/' + user.email()).set({ 'Authorization': chiefToken }).expect(200)

        await module.refresh()

        if (module.developersIDs().length !== 0) throw 'Wrong number of developers!'
        if (module.kanbanItems().length !== 2) throw 'Wrong number of tasks!'
        if (
            !module.kanbanItems().some(it => it.status() === States.DONE)
            && !module.kanbanItems().some(it => it.status() === States.TODO)
        ) throw 'Wrong tasks states!'

        return Promise.resolve()
    })
})