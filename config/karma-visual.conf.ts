module.exports = (config: any) => {
    config.set({
        frameworks: ["mocha", "chai", "karma-typescript"],
        singleRun: false,

        colors: true,
        reporters: [
            "karma-mocha-html-annotations-reporter",
            "karma-typescript"
        ],

        browsers: ['Chrome'],
        port: 9876,

        basePath: "..",
        baseURL: "/base/",

        autoWatch: true,
        files: [
            { pattern: "test/visual/**/*.spec.ts" }
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
                entrypoints: /\.spec\.ts$/,
                sourceMap: true
            },
            coverageOptions: {
                instrumentation: false,
                sourceMap: true,
            },
            include: [
                "test/visual/**/*.ts",
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
