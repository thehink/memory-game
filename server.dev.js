const path = require('path');
const express = require('express');
const webpack = require('webpack');

const config = require('./webpack.config');
const browserSync = require('browser-sync');


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  lazy: false,
  noInfo: true,
  publicPath: config.output.publicPath,
  quiet: false,
  stats: {
      colors: true
  },
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(require('./src/server/memory-game')(io));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/src/', 'index.html'));
});


const port = 3000;
const hostname = 'localhost';

server.listen(port, hostname, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server is now running at http://${hostname}:${port}.`);
});

var bsPort = 4000;
var bsUI = 4040;
var bsWeInRe = 4444;

browserSync.init({
  proxy: `${hostname}:${port}`,
  port: bsPort,
  open: false,
  ui: {
    port: bsUI,
    weinre: { port: bsWeInRe },
  },
});
