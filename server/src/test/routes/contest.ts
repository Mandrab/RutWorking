/**
 * Tests notifications routes
 * 
 * @author Paolo Baldini
 */
import { describe } from 'mocha'
import assert from 'assert'
import { Roles, getStatus, Project } from '../../main/models'
import { config as dbConfig } from '../../main/config/db'
import { connect } from 'mongoose'
import { _admin } from '../../main/config/firebase'
import { TestUser } from '../utils/TestUser'
import { DBUser } from '../../main/models/db'
import { TestModule } from '../utils/TestModule'
import { TestProject } from '../utils/TestProject'

const request = require('supertest')('http://localhost:8080')

const ADMIN = new TestUser('admin@admin.admin')
const USER_1 = new TestUser('user1@user1.user1')
const USER_2 = new TestUser('user2@user2.user2')
const PROJECT = new TestProject('a', new TestUser('x'), [new TestModule('b', new TestUser('y'), [])])

describe('test contest\' operations', function () {
    before(async function () {
        // connect to db
        await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        await clean()

        await ADMIN.register(Roles.ADMIN)
        await PROJECT.registerAll()
    })

    after(async function () { return clean() })

    const clean = async () => {
        await ADMIN.delete()
        await USER_1.delete()
        await USER_2.delete()
        await PROJECT.deleteAll()
    }

/**********************************************************************************************************************
    RESET CONTEST
**********************************************************************************************************************/

    it('reset', async function () {
        await USER_1.delete(); await USER_1.register(Roles.USER)
        await USER_2.delete(); await USER_2.register(Roles.USER)

        await request.put('/contest/reset').expect(500).expect('Token has not been passed!')

        await request.put('/contest/reset').set({ 'Authorization': await USER_1.getToken() }).expect(403)

        await request.put('/contest/reset').set({ 'Authorization': await ADMIN.getToken() }).expect(200)

        let contest = await getStatus(0)
        assert(contest.length === 0, 'After reset the contest should not list any user')

        await DBUser.updateOne({ email: USER_1.email }, { $set: { score: 100 } })

        contest = await getStatus(0)
        assert(contest.length === 1, 'User should now have 100 point as score')

        await request.put('/contest/reset').set({ 'Authorization': await ADMIN.getToken() }).expect(200)

        contest = await getStatus(0)
        assert(contest.length === 0, 'After reset the contest should not list any user')
    })

/**********************************************************************************************************************
    GET CONTEST STATUS
**********************************************************************************************************************/

    it('get', async function () {
        await USER_1.delete(); await USER_1.register(Roles.USER)
        await USER_2.delete();

        await request.get('/contest/ranking').expect(500).expect('Token has not been passed!')
        let res_1 = await request.get('/contest/ranking').set({ 'Authorization': await USER_1.getToken() }).expect(200)
        let res_2 = await request.get('/contest/ranking').set({ 'Authorization': await ADMIN.getToken() }).expect(200)

        assert(res_1.body.length === res_2.body.length, 'Admin & user should get same contest ranking')
        assert(res_1.body.length === 0, 'Ranking should not contains users')

        await DBUser.updateOne({ email: USER_1.email }, { $set: { score: 100 } })

        res_1 = await request.get('/contest/ranking').set({ 'Authorization': await USER_1.getToken() }).expect(200)
        res_2 = await request.get('/contest/ranking').set({ 'Authorization': await ADMIN.getToken() }).expect(200)

        assert(res_1.body.length === res_2.body.length, 'Admin & user should get same contest ranking')
        assert(res_1.body.length === 1, 'Ranking should contains one user')

        res_2 = await request.get('/contest/ranking/1').set({ 'Authorization': await ADMIN.getToken() }).expect(200)
        assert(res_2.body.length === 0, 'With skip 1 ranking should be empty')
    })

/**********************************************************************************************************************
    COMPLETE TASK INCREMENT
**********************************************************************************************************************/

    it('complete task increment', async function () {
        await USER_1.delete(); await USER_1.register(Roles.USER)

        let contest = await getStatus(0)
        let user_1_scores: any = contest.find(it => it.email === USER_1.email)
        user_1_scores = user_1_scores ? user_1_scores.score : 0

        let project = await Project.findByName(PROJECT.name)
        let module = project.modules().find(it => it.name() === PROJECT.modules[0].name)
        await module.newTask('qwerty')
        await module.addDeveloper((await USER_1.getUser())._id())
        await module.refresh()
        let taskID = module.kanbanItems()[0]._id()

        await request.put('/projects/' + PROJECT.name + '/modules/' + PROJECT.modules[0].name + '/kanban/' + taskID)
            .set({ 'Authorization': await USER_1.getToken() })
            .send({ newState: 'IN-PROGRESS', assignee: USER_1.email }).expect(200)

        contest = await getStatus(0)
        let user_1_scores_2 = contest.find(it => it.email === USER_1.email)

        assert(!user_1_scores_2 || user_1_scores === user_1_scores_2.score,
            'Score should be incremented only if task has been completed')

        await request.put('/projects/' + PROJECT.name + '/modules/' + PROJECT.modules[0].name + '/kanban/' + taskID)
            .set({ 'Authorization': await USER_1.getToken() }).send({ newState: 'TO-DO', assignee: USER_1.email })
            .expect(200)
        
        contest = await getStatus(0)
        user_1_scores_2 = contest.find(it => it.email === USER_1.email)

        assert(!user_1_scores_2 || user_1_scores === user_1_scores_2.score,
            'Score should be decremented only if task was completed')

        await request.put('/projects/' + PROJECT.name + '/modules/' + PROJECT.modules[0].name + '/kanban/' + taskID)
            .set({ 'Authorization': await USER_1.getToken() }).send({ newState: 'DONE', assignee: USER_1.email })
            .expect(200)
        
        contest = await getStatus(0)
        user_1_scores_2 = contest.find(it => it.email === USER_1.email).score

        assert(user_1_scores < user_1_scores_2, 'Score should be incremented if task has been completed')

        await request.put('/projects/' + PROJECT.name + '/modules/' + PROJECT.modules[0].name + '/kanban/' + taskID)
            .set({ 'Authorization': await USER_1.getToken() }).send({ newState: 'TO-DO', assignee: USER_1.email })
            .expect(200)
        
        contest = await getStatus(0)
        user_1_scores_2 = contest.find(it => it.email === USER_1.email).score

        assert(user_1_scores > user_1_scores_2, 'Score should be decremented if task has been retroceded')
    })
})