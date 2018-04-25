const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/client/workflow.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
//        test: /\.tsx?$/,
        use: "ts-loader",
        include: /src\/client|src\/shared/
      }
    ]
  },
  resolve: {
    extensions: [ ".ts", ".js" ]
  },
  optimization: {
    minimize: true
  },
  output: {
    library: "workflow",
    filename: "workflow.js",
    path: path.resolve(__dirname, "js")
  }
}
