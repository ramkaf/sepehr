const webpack = require('webpack');
const path = require('path');

module.exports = function (options) {
  return {
    ...options,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    },
    plugins: [
      ...options.plugins,
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/]
      })
    ],
    optimization: {
      minimize: false // Faster builds for dev
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules/
    }
  };
};