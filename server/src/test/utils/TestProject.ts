import { DBProject } from '../../main/models/db'
import { TestUser } from './TestUser'
import { TestModule } from './TestModule'
import { Roles } from '../../main/models'

/**
 * Class to simplify projects use on tests.
 * It sets some values as default and ignore some errors.
 * 
 * @author Paolo Baldini
 */
export class TestProject {

    constructor(
        readonly name: string,
        readonly chief: TestUser,
        readonly modules: TestModule[] = []
    ) { }

    /**
     * Autonomously register the project into mongo db
     */
    async register() {
        await new DBProject({
            name: this.name,
            chief: (await this.chief.getUser())._id(),
            modules: await Promise.all(this.modules.map(async it => it.document()))
        }).save().catch(_ => { })
    }

    /**
     * Autonomously register the project and it's users into mongo db
     */
    async registerAll() {
        await this.chief.register(Roles.USER)
        await Promise.all(this.modules.map(module =>
            Promise.all(module.users().map(it => it.register(Roles.USER)))))
        await this.register()
    }

    /**
     * Autonomously delete the project from mongo db
     */
    async delete() { return DBProject.deleteOne({ name: this.name }).catch(_ => { }) }

    /**
     * Autonomously delete the project and it's users from mongo db
     */
    async deleteAll() {
        await this.chief.delete()
        await Promise.all(this.modules.map(module =>
            Promise.all(module.users().map(it => it.delete()))))
        await this.delete()
    }
}

/**
 * A convenient builder to simplify TestProject classes creation.
 * 
 * @author Paolo Baldini
 */
export class TestProjectBuilders {
    private modules: TestModule[] = []
    private constructor(private name: string, private chief: TestUser) { }

    /**
     * Trasform the builder into a project
     * 
     * @returns the TestProject class
     */
    build(): TestProject { return new TestProject(this.name, this.chief, this.modules) }

    /**
     * Add a module to the project
     * 
     * @param name of the module
     * @param chief of the chief
     * @param developers assigned to the module
     * @returns the project-builder
     */
    addModule(name: string, chief?: string | TestUser, developers: string[] | TestUser[] = []): TestProjectBuilders {
        if (!chief) chief = this.chief
        if (!(chief instanceof TestUser)) chief = new TestUser(chief as any as string)

        if (developers.length > 0 && !(developers[0] instanceof TestUser))
            developers = (developers as string[]).map(it => new TestUser(it))

        this.modules = this.modules.concat(new TestModule(name, chief as TestUser, developers as TestUser[]))
        return this
    }

    /**
     * Being the constructor private, it's the only method to instantiate the builder.
     * 
     * @param name of the project
     * @param chief of the project
     * @returns the project-builder
     */
    static new(name: string, chief: string | TestUser): TestProjectBuilders {
        if (!(chief instanceof TestUser)) { chief = new TestUser(chief as any as string) }

        return new TestProjectBuilders(name, chief as TestUser)
    }
}