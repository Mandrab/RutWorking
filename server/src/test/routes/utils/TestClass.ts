/**
 * Utilities to test-class
 * 
 * @author Paolo Baldini
 */
export namespace TestClass {

    export function array<T>(length: number, strategy: (idx?: number) => T): T[] {
        return new Array(length).fill(0).map(idx => strategy(idx))
    }

    /**
     * Generate an associative array
     * 
     * @param keys key array
     * @param strategy to generate the value
     */
    export function associativeArray<T>(keys: string[], strategy: (idx?: number) => T): { [key: string]: T } {

        let result: { [key: string]: T } = { }
        keys.forEach((it, idx) => {
            result[it] = strategy(idx)
        })
        return result
    }
}