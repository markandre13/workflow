process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = (config) => {
  config.set({
    basePath: '',
    baseURL: '/base/',
    frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
    files: [ 
      "polyfill/path-data-polyfill.js",
      { pattern: "test/unit/**/*.spec.ts" },
      { pattern: "src/shared/**/*.ts" },
      { pattern: "src/client/**/*.ts" },
      { pattern: "img/**/*.svg", watched: false, included: false, served: true }
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

    // browserNoActivityTimeout: 0
  })
}
