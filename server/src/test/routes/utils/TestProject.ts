import { DBProject } from '../../../main/models/db'
import { TestUser } from './TestUser'
import { TestModule } from './TestModule'
import { Roles } from '../../../main/models'

/**
 * Class to simplify projects use on tests.
 * It set some values as default and ignore errors.
 * 
 * @author Paolo Baldini
 */
export class TestProject {

    constructor(
        readonly name: string,
        readonly chief: TestUser,
        readonly modules: TestModule[] = []
    ) { }

    async register() {
        await new DBProject({
            name: this.name,
            chief: (await this.chief.getUser())._id(),
            modules: await Promise.all(this.modules.map(async it => it.document()))
        }).save().catch(_ => { })
    }
    async registerAll() {
        await this.chief.register(Roles.USER)
        await Promise.all(this.modules.map(module =>
            Promise.all(module.users().map(it => it.register(Roles.USER)))))
        await this.register()
    }

    async delete() { return DBProject.deleteOne({ name: this.name }).catch(_ => { }) }
    async deleteAll() {
        await this.chief.delete()
        await Promise.all(this.modules.map(module =>
            Promise.all(module.users().map(it => it.delete()))))
        await this.delete()
    }
}

/**
 * A convenient builder to simplify TestProject creation.
 * 
 * @author Paolo Baldini
 */
export class TestProjectBuilders {
    private modules: TestModule[] = []
    private constructor(private name: string, private chief: TestUser) { }

    build(): TestProject { return new TestProject(this.name, this.chief, this.modules) }

    addModule(name: string, chief?: string | TestUser, developers: string[] | TestUser[] = []): TestProjectBuilders {
        if (!chief) chief = this.chief
        if (!(chief instanceof TestUser)) chief = new TestUser(chief as any as string)

        if (developers.length > 0 && !(developers[0] instanceof TestUser))
            developers = (developers as string[]).map(it => new TestUser(it))

        this.modules = this.modules.concat(new TestModule(name, chief as TestUser, developers as TestUser[]))
        return this
    }

    static new(name: string, chief: string | TestUser): TestProjectBuilders {
        if (!(chief instanceof TestUser)) { chief = new TestUser(chief as any as string) }

        return new TestProjectBuilders(name, chief as TestUser)
    }
}