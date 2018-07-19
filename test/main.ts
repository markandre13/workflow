//import * as mylib from "figureeditor/"

let testMap = new Map<string, Function>()

export function register(testName: string, test: Function) {
    console.log("registering test '"+testName+"'")
    testMap.set(testName, test)
}

export function run(testName: string) {
    (testMap.get(testName)!)()
}

export function main() {
    console.log("executing main()")
}
