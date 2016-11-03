const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const args = require('minimist')(process.argv.slice(2));

const allowedEnvs = ['dev', 'dist', 'test', 'server'];
let env;
if (args._.length > 0 && args._.indexOf('start') !== -1) {
  env = 'test';
} else if (args.env) {
  env = args.env;
} else {
  env = 'dev';
}
process.env.WEBPACK_ENV = env;

let port = 3000;

let config = {
  extensions: [ '', '.js', '.jsx' ],
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, './build/client/assets'),
    filename: 'app.js',
    publicPath: '/assets/'
  },
  plugins: [],
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        include: './src/',
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
      {
  		  test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
  		  loader: "url?limit=10000&mimetype=application/font-woff"
  		},
      {
  		  test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
  		  loader: "url?limit=10000&mimetype=application/font-woff"
  		},
      {
  		  test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
  		  loader: "url?limit=10000&mimetype=application/octet-stream"
  		},
      {
  		  test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
  		  loader: "file"
  		},
      {
  		  test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
  		  loader: "url?limit=10000&mimetype=image/svg+xml"
  		},
      {
        test: /\.(mp4|ogg|svg|jpg)$/,
        loader: 'file-loader'
      }
    ]
  },
}

if(env === 'dev'){
  Object.assign(config, {
    entry: [
      //'webpack-dev-server/client?http://localhost:' + port,
      //'webpack/hot/only-dev-server',
      'webpack/hot/dev-server',
      'webpack-hot-middleware/client',
      './src/index'
    ],
    port: port,
    devServer: {
      contentBase: './src/',
      historyApiFallback: true,
      hot: true,
      port:port,
      publicPath: '/assets/',
      noInfo: false
    },
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  });

  config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    include: path.join(__dirname, 'src')
  });
}

if(env === 'server'){
  const nodeModules = {};
    fs.readdirSync('node_modules')
      .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
      })
      .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
      });


  Object.assign(config, {
    target: 'node',
    context: __dirname,
    node: {
      __filename: true
    },
    output: {
      path: path.join(__dirname, './build/server'),
      filename: 'server.build.js',
      publicPath: './build/server/',
      libraryTarget : 'commonjs'
    },
    entry: [
      './src/server/server'
    ],
    cache: false,
    devtool: 'sourcemap',
    externals: nodeModules,
    plugins: [
      new webpack.IgnorePlugin(/\.(css|less)$/),
      //new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      //new webpack.optimize.UglifyJsPlugin(),
      //new webpack.optimize.OccurenceOrderPlugin(),
      //new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  });
  config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    include: path.join(__dirname, 'src')
  });

  config.module.loaders.push({
    test: /\.(json)$/,
    loader: 'file-loader'
  });
}

if(env === 'dist'){
  Object.assign(config, {
    entry: [
      './src/index'
    ],
    port: port,
    devServer: {
      contentBase: './src/',
      historyApiFallback: true,
      hot: true,
      port:port,
      publicPath: '/assets/',
      noInfo: false
    },
    cache: false,
    devtool: 'sourcemap',
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  });
  config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: 'babel',
    include: path.join(__dirname, 'src')
  });
}


module.exports = config;
