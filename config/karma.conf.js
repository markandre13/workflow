process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = (config) => {
  config.set({
    basePath: '..',
    baseURL: '/base/',
    frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
    files: [
      "polyfill/path-data-polyfill.js",
      { pattern: "src/shared/**/*.ts" },
      { pattern: "src/client/**/*.ts" },
      { pattern: "test/unit/**/*.spec.ts" },
      { pattern: "img/**/*.svg", watched: false, included: false, served: true }
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    // change Karma's debug.html to the mocha web reporter
    reporters: ["mocha", "karma-typescript"],

    // require specific files after Mocha is initialized
    // require: [require.resolve('bdd-lazy-var/bdd_lazy_var_global')],

    // // custom ui, defined in required file above
    // ui: 'bdd-lazy-var/global',

    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/
      },
      tsconfig: "tsconfig.json",
      // compilerOptions: {
      //   target: "es6",
      //   module: "commonjs",
      //   moduleResolution: "node",
      //   traceResolution: false,
      //   lib: ["es6", "es2017.object", "dom"],
      //   baseUrl: "src",
      //   paths: {
      //     // this config get's up through compiling via typescript, but
      //     // fails at node_modules/karma-typescript/dist/client/commonjs.js
      //     "shared/*": ["shared/*"],
      //     "client/*": ["client/*"]
      //   },
      //   strict: true,
      //   downlevelIteration: true,
      //   allowJs: false,
      //   noImplicitAny: true,
      //   sourceMap: true
      // },
      include: [
        "src/shared/**/*.ts",
        "src/client/**/*.ts",
        "test/unit/**/*.spec.ts"
      ],
      exclude: ["node_modules", "test/ui", "test/visual"]
    },
    port: 9876,
    colors: true,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true

    // browserNoActivityTimeout: 0
  })
}
