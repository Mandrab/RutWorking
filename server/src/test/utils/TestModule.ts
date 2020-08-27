import { TestUser } from "./TestUser"

/**
 * Class to simplify module use on tests.
 * It set some values as default and ignore some errors.
 * 
 * @author Paolo Baldini
 */
export class TestModule {

    constructor(
        readonly name: string,
        readonly chief: TestUser,
        readonly developers: TestUser[] = []
    ) { }

    /**
     * Returns users of the module. It returns only the values given at instantiation time.
     * 
     * @return the developers and chief as an array of TestUser
     */
    users() { return this.developers.concat(this.chief) }

    /**
     * Returns the module retrieving the users' ids autonomously
     * 
     * @return an object representing the module with users' ids already obtained
     */
    async document() {
        return {
            name: this.name,
            chief: (await this.chief.getUser())._id(),
            developers: await Promise.all(this.developers.map(async it => (await it.getUser())._id())),
            chatMessages: [] as any[],
            kanbanItems: [] as any[]
        }
    }
}