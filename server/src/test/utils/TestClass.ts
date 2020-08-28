/**
 * Utilities functions to simplify/clarify tests
 * 
 * @author Paolo Baldini
 */
export namespace TestClass {

    /**
     * Generate an associative array. It's composed by a string key and an object value
     * 
     * @param keys keys array
     * @param strategy to generate the value based on the index
     * @returns array/map of key-value pairs
     */
    export function associativeArray<T>(
        keys: string[],
        strategy: (idx?: number, key?: string) => T
    ): { [key: string]: T } {

        let map: { [key: string]: T } = { }
        keys.forEach((it, idx) => {
            map[it] = strategy(idx)
        })
        return map
    }
}