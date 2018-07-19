// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
//const { CheckerPlugin } = require('awesome-typescript-loader')
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '',
    filename: 'app.js'
  },
  module: {
    loaders: [

      {test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, loader: "file-loader"}, //|css
      {test: /\.tsx?$/, loader: "awesome-typescript-loader", exclude: /node_modules/},

      {enforce: "pre", test: /\.js$/, exclude: /node_modules/},
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract({
          fallback: {loader: 'style-loader'},
          use: [
            'css-loader', {
              loader: 'stylus-loader',
              options: {}
            }
          ]
        })
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin("styles.css"),
    new HtmlWebpackPlugin({
      hash: true,
      filename: 'index.html',
      template: 'htmlTemplates/index_deploy.ejs',
      inject: true,
      cache: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false},
      uglifyOptions: {
        ie8: false,
        mangle: true,
        compress: {
          properties: true,
          dead_code: true,
          conditionals: true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          if_return: true,
          join_vars: true,
          collapse_vars: true,
          reduce_vars: true,
          negate_iife: true,
          warnings: true
        }
      }
    }),
    new CopyWebpackPlugin([
      {
        from: 'node_modules/react/dist/react.min.js',
        to: 'react.js',
      },
      {
        from: 'node_modules/react-dom/dist/react-dom.min.js',
        to: 'react-dom.js',
      },

      {
        from: 'node_modules/bulma/css/bulma.min.css',
        to: 'bulma.css',
      },
      {
        from: 'node_modules/bulma-extensions/dist/css/bulma-extensions.min.css',
        to: 'bulma-extensions.css',
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
  ],
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".css"]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
}
