module.exports = (config) => {
  config.set({
    debug: true,

    frameworks: ["mocha", "chai", "karma-typescript"],
    singleRun: true,

    // report
    reporters: ["mocha", "karma-typescript"],
    colors: true,

    // debugging with vscode will spawn it's own browser and connect it to
    // karma's http server at: http://localhost:9876/debug.html, hence it
    // works best with an empty browser list.
    // as an empty browser list can not be specified on the command line,
    // it needs to be empty here. the npm script will then to specifiy a
    // browser to work
    browsers: [],
    port: 9876,

    // karma http server home directory
    basePath: "..",
    baseURL: "/base/",

    // files to serve
    autoWatch: false, // karma-typescript does it's own watching (is this okay or do we need 'watch: false' ?)
    files: [
      { pattern: "test/setup.ts" },
      { pattern: "test/unit/**/*.ts" },
      { pattern: "src/client/**/*.ts" },
      { pattern: "src/shared/**/*.ts" },
      { pattern: "polyfill/path-data-polyfill.js"},
      { pattern: "img/**/*.svg", included: false, served: true },
      { pattern: 'node_modules/**/*.js.map', included: false, served: true, nocache: true }
    ],

    // compile
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
        "test/unit/**/*.ts",
        "test/setup.ts",
        "src/shared/**/*.ts",
        "src/client/**/*.ts",
      ],
      exclude: [
        "node_modules",
        "test/ui",
        "test/visual",
      ]
    },
  })
}
