const express = require('express');

let io;
let players = [];
let board = [];
let currentGame = false;
let gameLoopTimeout = null;

const newGame () => {

}

const gameLoop () => {
  let activePlayers = players.filter(player => {
    return player.socket.connected;
  });

  if(activePlayers.length < 2){
    io.emit('status', 'Not enough players!');
  }
}


const memoryGame = (_io) => {
  io = _io;
  const router = express.Router();

  router.get('/api',  (req, res, next) => {
    console.log('Got APi');
  });



  _io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('message', (message) => {
      console.log('Message', message);
    });

    socket.on('auth', (player) => {
      const name = player.name;
      const guid = player.guid;

      console.log('Message', message);
    })
  });

  return router;
}

module.exports = memoryGame;
