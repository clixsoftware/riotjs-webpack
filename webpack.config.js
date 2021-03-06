const path = require('path')
const webpack = require('webpack')
const WebpackMd5Hash = require('webpack-md5-hash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const PUBLIC_PATH = 'https://pmcalabrese.github.io/riotjs-webpack/';
const SERVICE_WORKER_FILENAME = 'service-worker.js';

const extractSass = new ExtractTextPlugin({
  filename: "[name].[contenthash].css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = {
  "resolveLoader": {
    "modules": [
      "./node_modules"
    ]
  },
  entry: {
    app: [
      "./src/main.js"
    ],
    styles: [
      "./src/styles.scss"
    ]
  },
  output: {
    path: path.resolve(__dirname, './public'),
    publicPath: '',
    filename: '[name].bundle.js',
    chunkFilename: "[chunkhash].[id].chunk.js"
  },
  plugins: [
    extractSass,
    new SWPrecacheWebpackPlugin(
      {
        cacheId: 'riotjs',
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        filename: 'service-worker.js',
        minify: true,
        navigateFallback: PUBLIC_PATH + 'index.html',
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      }
    ),
    new UglifyJSPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: (module) => module.resource && module.resource.startsWith(nodeModules),
      filename: 'vendor.bundle.js',
      "chunks": [
        "main"
      ]
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new HtmlWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      hash: true,
      inject: true,
      compile: true,
      favicon: false,
      minify: false,
      cache: true,
      showErrors: true,
      chunks: "all",
      excludeChunks: [],
      title: "Webpack App",
      xhtml: true,
      serviceWorker: `/${SERVICE_WORKER_FILENAME}`,
    }),
    new CopyWebpackPlugin([
      { from: 'src/manifest.json' }
    ]),
    new webpack.ProvidePlugin({ riot: 'riot' }),
    // new webpack.optimize.UglifyJsPlugin({
    //   name: 'vendor',
    //   // sourceMap: true,
    //   minimize: true,
    //   compress: {
    //     warnings: false,
    //     screw_ie8: true,
    //     conditionals: true,
    //     unused: true,
    //     comparisons: true,
    //     sequences: true,
    //     dead_code: true,
    //     evaluate: true,
    //     if_return: true,
    //     join_vars: true,
    //   },
    //   output: {
    //     comments: false
    //   },
    // })
  ],
  module: {
    loaders: [
      {
        test: /\.tag\.html$/,
        exclude: /node_modules/,
        loader: 'riot-tag-loader',
        // options: {
        //   type: 'es6', // transpile the riot tags using babel
        //   hot: true,
        //   debug: false
        // }
      },
      {
        test: /\.tag\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ["stage-3", "stage-2", "stage-1", "es2015"],
          plugins: ["autobind-class-methods", "babel-plugin-transform-class-properties"]
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ["stage-3", "stage-2", "stage-1", "es2015"],
          plugins: ["autobind-class-methods", "babel-plugin-transform-class-properties"]
        },
      },
      // {
      //   test: /\.css$/i,
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: 'css-loader'
      //   })
      // },
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [{
                loader: "css-loader", options:{
                  minimize: true
                }
            }, {
                loader: "sass-loader", options: {
                  minimize: true
                }
            }],
            // use style-loader in development
            fallback: "style-loader"
        })
      }
    ]
  }
}
