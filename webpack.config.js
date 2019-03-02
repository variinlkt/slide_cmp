const HtmlWebpackPlugin = require('html-webpack-plugin')
// const webpack = require('webpack')
module.exports = {
  mode: "development",
    entry: "./index.js",
    output: {
      path: __dirname + "/dist",
      filename: "main.js"
    },
    devtool:false,
    optimization: {
      minimize: true,
      usedExports: true, 
      // sideEffects: true,
    //   concatenateModules: true,
    },
    module: {
        rules: [
          {
            test: /\.html$/,
            use: [
              "html-loader"
            ]
          },
          {
            test:/\.js$/,
            exclude: /node_modules/, 
            use:[
              'babel-loader'
            ]
          },
        ]
      },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: __dirname + '/index.html'
    }),
    // new webpack.optimize.ModuleConcatenationPlugin()
  ]
}