const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2']

module.exports = {
  entry: {
    'background-script': './src/background-page/index.js',
    'content-script': './src/content-page/index.js',
    'popup': './src/popup-page/index.jsx',
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js'
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, 'src/shared/'),
      fonts: path.resolve(__dirname, 'src/fonts/'),
    },
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: 'src/manifest.json',
      transform: function (content, path) {
        // generates the manifest file using the package.json informations
        return Buffer.from(JSON.stringify({
          ...JSON.parse(content.toString())
        }, null, '\t'))
      }
    }]),
    new CopyWebpackPlugin([
      {
        from:'src/img',
        to: 'img'
      },
      {
        from:'src/styles',
        to: 'styles'
      },
    ]), 
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup-page', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background-page', 'index.html'),
      filename: 'background.html',
      chunks: ['background-script']
    }),
  ]
}

