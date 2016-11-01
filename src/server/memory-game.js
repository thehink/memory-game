const express = require('express');
const Guid = require('guid');

import Cards from '../cards.json';
//const Player = require('./player');
//const Game = require('./game');


const memoryGame = (io) => {
  const router = express.Router();
  //const game = new Game(io);

  router.get('/api',  (req, res, next) => {
    console.log('Got APi');
  });

  io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('auth', (player) => {
      const name = player.name;
      const guid = player.guid;

      console.log('Auth', name, guid);
    });

    socket.on('checkCard', index => {

    });


  });
  return router;
}

module.exports = memoryGame;
