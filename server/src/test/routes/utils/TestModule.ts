import { TestUser } from "./TestUser"

/**
 * Class to simplify module use on tests.
 * It set some values as default and ignore errors.
 * 
 * @author Paolo Baldini
 */
export class TestModule {

    constructor(
        readonly name: string,
        readonly chief: TestUser,
        readonly developers: TestUser[] = []
    ) { }
    
    users() { return this.developers.concat(this.chief) }

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