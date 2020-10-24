const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/client/workflow.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig-client.json"
            }
          }
        ],
        include: /src\/client|src\/shared/
      }
    ]
  },
  resolve: {
    extensions: [ ".ts", ".js" ]
  },
  optimization: {
    minimize: false
  },
  output: {
    library: "workflow",
    filename: "workflow.js",
    path: path.resolve(__dirname, "js")
  }
}
