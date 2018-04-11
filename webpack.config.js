const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
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
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  optimization: {
    minimize: true
  },
  output: {
    filename: "workflow.js",
    path: path.resolve(__dirname, "dist")
  }
}
