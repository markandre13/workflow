var glob = require("glob")
const path = require("path")

let files = glob.sync("./test/**/script.ts")
files.push("./test/main.ts")

module.exports = {
  mode: "development",
  entry: {
     js: files // glob.sync("./test/**/script.ts").push("./test/main.ts")
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig-test.json"
            }
          }
        ],
        include: /src\/client|src\/shared|test/,
        exclude: /\.spec.ts$/
      }
    ]
  },
  resolve: {
    extensions: [ ".ts", ".js" ],
    modules: [ "./src", "./node_modules", "." ]
  },
  optimization: {
    minimize: true
  },
  output: {
    library: "unittest",
    filename: "unittest.js",
    path: path.resolve(__dirname, "js")
  }
}
