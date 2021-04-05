const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const BUILD_PATH = './';

module.exports = {
  entry: [
    './index.js',
  ],
  output: {
    filename: 'magnet.min.js',
    path: path.resolve(__dirname, BUILD_PATH),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
      },
      {
        test: /\.ts$/i,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './demo.html',
      filename: './index.html',
    }),
  ],
  devtool: 'eval',
  devServer: {
    https: false,
    contentBase: BUILD_PATH,
    host: '0.0.0.0',
    public: 'localhost:8080',
    port: '8080',
    open: true,
    inline: true,
    compress: true,
    hot: true,
  },
};
