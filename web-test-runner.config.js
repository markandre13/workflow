process.env.NODE_ENV = 'test'
import WTRSpecReporter from "./test/WTRSpecReporter.js"

export default {
    nodeResolve: true,
    plugins: [
    ],
    coverage: false,
    coverageConfig: {},
    reporters: [
        WTRSpecReporter({ reportTestResults: true, reportTestProgress: true }),
    ],
}
