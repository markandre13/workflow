module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
    files: [ 
      { pattern: "test/unit/**/*.spec.ts" },
      { pattern: "src/shared/*.ts" }
    ],
    preprocessors: { 
      "**/*.ts": ["karma-typescript"],
      "": ['coverage'] // get's accidentily executed when installed
    },
    reporters: ["mocha", "karma-typescript"],
    karmaTypescriptConfig: {
      tsconfig: "tsconfig-test-unit.json",
//      include: [
//        "src", "test/unit"
//      ]
    },
    port: 9876,
    colors: true,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true
    // browserNoActivityTimeout: 0
  })
}
