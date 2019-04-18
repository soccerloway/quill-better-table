const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry:{
      'quill-better-table.js': ['./src/quill-better-table.js'],
      'quill-better-table': ['./src/assets/quill-better-table.scss'],
      'demo/demo1.js': './demo/js/demo1.js'
    },

    output:{
      filename: '[name]',
      library: 'quill-better-table',
      libraryExport: 'default',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, './dist/')
    },

    resolve: {
      alias: {
        'src': path.resolve(__dirname, './src')
      },
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
            !isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
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
                  'env',
                  {
                    targets: {
                      browsers: [
                        'last 2 Chrome major versions',
                        'last 2 Firefox major versions',
                        'last 2 Safari major versions',
                        'last 2 Edge major versions',
                        'last 2 iOS major versions',
                        'last 2 ChromeAndroid major versions',
                      ],
                    },
                  }
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
      }),

      new webpack.HotModuleReplacementPlugin({})
    ],

    devServer:{
      host:'localhost',
      contentBase: path.join(__dirname, './dist/demo'),
      port: 8080,
      hot: false
    }
  }
}
