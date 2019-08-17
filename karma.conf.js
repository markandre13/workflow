module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
    files: [ 
      "polyfill/path-data-polyfill.js",
      { pattern: "test/unit/**/*.spec.ts" },
      { pattern: "src/shared/**/*.ts" },
      { pattern: "src/client/**/*.ts" }
    ],
    preprocessors: { 
      "**/*.ts": ["karma-typescript"],
      "": ['coverage'] // get's accidently executed when installed
    },
    reporters: ["mocha", "karma-typescript"],
    karmaTypescriptConfig: {
      tsconfig: "tsconfig-test-unit.json"
    },
    port: 9876,
    colors: true,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true

    // browsers: ['Headless'],
    // autoWatch: true,
    // singleRun: false


    // browserNoActivityTimeout: 0
  })
}
