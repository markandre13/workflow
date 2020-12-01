module.exports = (config: any) => {
    config.set({
//        basePath: ".",
//        baseURL: "src",
        frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
        reporters: [
            "karma-mocha-html-annotations-reporter",
            "karma-typescript"
        ],
        preprocessors: { 
            "../test/**/*.ts": ["karma-typescript"]
        },
        files: [ 
            { pattern: "../test/visual/**/*.spec.ts" }
        ],
        karmaTypescriptConfig: {
            tsconfig: "../tsconfig.json",
            exclude: [
                "src/**/*.ts",
                "test/unit/**/*.ts",
                "test/ui/**/*.ts",
                "node_modules"
            ],
            include: [
                "test/visual/**/*.ts"
            ]
        },
        port: 9876,
        colors: true,
        browsers: ['Chrome'],
        autoWatch: true,
        singleRun: false
    })
}
