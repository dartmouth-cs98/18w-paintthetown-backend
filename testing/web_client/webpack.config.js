const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fileLoader = require('file-loader');
const autoprefixer = require('autoprefixer');

module.exports = {
  stats: { colors: true },
  devtool: 'inline-source-map',
  entry: ['babel-polyfill', './src'],
  output: {
    path: 'build',
    publicPath: 'build/',
    filename: 'bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
    },
    {
      test: /\.scss/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader?url=false !sass-loader!postcss-loader'),
    }, {
      test: /\.(png|svg|jpg|gif)$/,
      loader: 'file-loader',
    }],
  },
  postcss: [autoprefixer({ browsers: ['last 2 versions'] })],
  plugins: [
    new ExtractTextPlugin('bundle.css'),
  ],
  devServer: {
    port: 8080,
    historyApiFallback: {
      index: 'index.html',
    },
  },
};
