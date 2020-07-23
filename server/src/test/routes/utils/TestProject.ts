import { DBProject } from '../../../main/models/db'
import { TestUser } from './TestUser'
import { TestModule } from './TestModule'

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
        }).save().catch(_ => {  console.log(_)})
    }

    async delete() { return DBProject.deleteOne({ name: this.name }).catch(_ => { }) }
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

    static associativeArray(keys: string[], strategy: (idx?: number) => TestProject): { [key: string]: TestProject } {
        let result: { [key: string]: TestProject } = { }
        keys.forEach((it, idx) => {
            result[it] = strategy(idx)
        })
        return result
    }
}