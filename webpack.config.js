const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const BUILD_PATH = './';

module.exports = {
  entry: [
    './index.ts',
  ],
  output: {
    filename: 'magnet.js',
    path: path.resolve(__dirname, BUILD_PATH),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.[j|t]s(\?.*)?$/i,
        minify: (file, sourceMap, minimizerOptions) => {
          // The `minimizerOptions` option contains option from the `terserOptions` option
          // You can use `minimizerOptions.myCustomOption`
          const extractedComments = [];

          // Custom logic for extract comments

          const { map, code } = require('uglify-js')
            .minify(file, {
              /* Your options for minification */
            });

          return { map, code, extractedComments };
        },
      }),
    ],
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
    // open: true,
    inline: true,
    compress: true,
    hot: true,
  },
};
