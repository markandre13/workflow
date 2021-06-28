module.exports = (config: any) => {
    config.set({
        frameworks: ["mocha", "chai", "karma-typescript"],
        singleRun: false,

        colors: true,
        reporters: [
            "karma-mocha-html-annotations-reporter",
            "karma-typescript"
        ],

        port: 9876,
        browsers: ['ChromeDevTools'],
        customLaunchers: {
            ChromeDevTools: {
                base: 'Chrome',
                flags: [
                    '--auto-open-devtools-for-tabs'
                ],
            },
        },

        basePath: "..",
        baseURL: "/base/",

        autoWatch: true,
        files: [
            { pattern: "test/visual/**/*.spec.ts" },
            { pattern: "test/setup.ts" },
            { pattern: "src/client/**/*.ts" },
            { pattern: "src/shared/**/*.ts" },
            { pattern: "polyfill/path-data-polyfill.js"},
            { pattern: "img/**/*.svg", included: false, served: true },
            { pattern: 'node_modules/**/*.js.map', included: false, served: true, nocache: true }
        ],

        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },
        karmaTypescriptConfig: {
            tsconfig: "tsconfig.json",
            compilerOptions: {
                module: "commonjs",
                sourceMap: true,
            },
            bundlerOptions: {
                sourceMap: true
            },
            coverageOptions: {
                instrumentation: false,
                sourceMap: true,
            },
            include: [
                "test/visual/**/*.ts",
                "test/setup.ts",
                "src/client/**/*.ts",
                "src/shared/**/*.ts",
            ],
            exclude: [
                "test/unit/**/*.ts",
                "test/ui/**/*.ts",
                "node_modules"
            ],
        },
    })
}
