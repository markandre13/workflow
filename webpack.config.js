const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/workflow.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
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
