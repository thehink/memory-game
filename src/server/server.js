'use strict';

const express = require('express');
const app = express();
const router = express.Router();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static('./dist'));

app.use(require('./memory-game')(io));

app.get('/', function(req, res) {
    res.sendfile('./dist/index.html');
});

server.listen(8080);
