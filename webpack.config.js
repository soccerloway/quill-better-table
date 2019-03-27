const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry:{
    'quill-better-table.js': ['./src/quill-better-table.js'],
    'demo/demo1.js': './demo/js/demo1.js'
  },

  output:{
    filename: '[name]',
    library: 'NbEditor',
    libraryExport: 'default',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist/')
  },

  resolve: {
    alias: {},
    extensions: ['.js', '.scss', '.html']
  },

  module: {
    rules: [
      {
        test: /\.(jpg|jpeg|png)$/,
        include: [
          path.resolve(__dirname, '../src/assets/imgs')
        ],
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }]
      },

      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }]
      },

      {
        test: /\.scss$/,
        use: [
          // fallback to style-loader in development
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },

      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'env'
              ]
            ]
          }
        }
      }
    ]
  },

  plugins:[
    new HtmlWebpackPlugin({
      title:'quill-better-table',
      template:'./demo/demo1.html',
      filename:'demo/demo1.html',
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].[id].css'
    })
  ],

  devServer:{
    host:'localhost',
    contentBase: path.join(__dirname, './dist/demo'),
    port: 8080
  }
}