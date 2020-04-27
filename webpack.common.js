const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const validEnvs = ['development', 'production'];
module.exports = {
  mode: validEnvs.includes(process.NODE_ENV) ? process.NODE_ENV : 'development',
  entry: {
    "calls-3rd-party-api":"./dist/src/lambdas/calls-3rd-party-api.js",
    "fails-miserably":"./dist/src/lambdas/fails-miserably.js",
    "sync-errors":"./dist/src/lambdas/sync-errors.js",
  },
  devtool: 'source-map',
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.ts',
      '.tsx'
    ],
    modules: [path.resolve(__dirname, './dist/src'), 'node_modules']
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, 'dist/published'),
    filename: '[name].js',
  },
  externals: ["aws-sdk"],
  target: 'node',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [
        { loader: 'cache-loader' },
        {
          loader: 'thread-loader',
          options: {
            // there should be 1 cpu for the fork-ts-checker-webpack-plugin
            workers: require('os').cpus().length - 1,
          },
        },
        {
          loader: "ts-loader",
          options: {
            // happyPackMode: true // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
          }
        }
      ]
    }]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true })
  ],
  optimization: {
    nodeEnv: false
  }
};
