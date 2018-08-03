let testMap = new Map<string, Function>()

export function register(testName: string, test: Function) {
    console.log("registering test '"+testName+"'")
    testMap.set(testName, test)
}

export function run(testName: string): any {
    return (testMap.get(testName)!)()
}
