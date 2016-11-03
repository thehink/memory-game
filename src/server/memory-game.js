const express = require('express');
const Guid = require('guid');
const fs = require('fs');
const path = require('path');

import Game from '../shared/game';
import CardsJSON from '../cards.json';
const Cards = typeof asdasd === "string" ? JSON.parse(fs.readFileSync(CardsJSON, 'utf8')) : CardsJSON;

const pairs = 8;

const getRandomCards = () => {
  Cards.sort((a,b) => {
    return 0.5 - Math.random();
  });

  let cardsToUse = [];

//select cards
  for(let i = 0; i < pairs*2; ++i){
    const card = Cards[Math.floor(i/2)];
    cardsToUse.push({
      name: card.name,
      src: card.src
    })
  }

//randomize selected cards
  cardsToUse.sort((a,b) => {
    return 0.5 - Math.random();
  });

  return cardsToUse;
}

const tryStartGame = (game) => {
  let startGameInterval = setInterval(()=> {
      console.log('Trying to start a new game...');

      if(game.players.length < 1){
        console.log('error', 'Minimum of 1 players needed to start a game!');
        return;
      }

      game.newGame();
      console.log('Game started!');
      clearTimeout(startGameInterval);
      startGameInterval = null;


  }, 2000);
}


const memoryGame = (io) => {
  const router = express.Router();
  const game = new Game();
  game.setCards(getRandomCards());

  //game.on('status', status => console.log('GAME_STATUS', status));
  game.on('error', error => console.log('GAME_ERROR', error));
  game.on('addPlayer', player => io.emit('addPlayer', player));
  game.on('removePlayer', guid => io.emit('removePlayer', guid));
  game.on('updatePlayer', player => io.emit('updatePlayer', player));
  game.on('newGame', () => io.emit('newGame'));
  game.on('resetGame', () => io.emit('resetGame'));
  game.on('setCards', () => io.emit('setCards', game.getState().cards));
  game.on('flipCard', (guid, index) => {
    const card = game.getCard(index);

    //make client aware of card contents
    io.emit('updateCard', {
      index: card.index,
      name: card.name,
      src: card.src
    });

    //flip card on client
    console.log('FlipCard', {guid: guid, index: card.index});
    io.emit('flipCard', {guid: guid, index: card.index});
  });

  //game.on('wait', text => io.emit('status', text));

  game.on('gameFinished', player => {
    console.log('Game finished!');
    //io.emit('status', 'Game finished, will try to start a new game in 10 seconds');
    //setTimeout(() => tryStartGame(game), 1000*10);
  });

  io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('status', 'Connected!');

    socket.on('flipCard', index => {
      if(!socket.player){
        return;
      }

      console.log('Player tried to flip card', index);
      const player = socket.player;
      game.flipCard(player.guid, index);
    });

    socket.on('requestNewGame', (cardsSearchString) => {
      console.log('Got New Game request');
      game.setCards(getRandomCards());
      game.newGame();
    });

    socket.on('requestResetGame', () => {
      console.log('Got Reset Game request');
      game.resetGame();
    });

    socket.on('disconnect', () => {
      if(socket.player){
        const guid = socket.player.guid;
        socket.player.timeout = setTimeout(() => {
          //delete a player after being disconnected for 10 seconds
          console.log('10 seconds have passed so we will remove player!');
          game.removePlayer(guid);
        }, 1000*10);
      }
    })

    socket.on('auth', (player) => {
      if(!player){
        return socket.emit('game_error', 'You need to send some player data!');
      }

      const name = player.name;
      const guid = player.guid;

      if(player.guid){
        let existingPlayer = game.getPlayer(player.guid);
        if(existingPlayer){
            if(existingPlayer.timeout){
              clearTimeout(existingPlayer.timeout);
            }
            existingPlayer.socket.player = null;
            existingPlayer.socket.disconnect();
            player = existingPlayer;
        }else{
          //socket.emit('game_error', 'Couldnt find player with GUID: ' + guid);
          player.guid = Guid.raw();
          player = game.addPlayer(player); //Add new player
        }
      }else{
        player.guid = Guid.raw();
        player = game.addPlayer(player);
      }

      socket.player = player;
      player.socket = socket;

      socket.emit('authSuccess', player.getInfo());
      socket.emit('gameState', game.getState());
      console.log('Auth', name, guid);
    });

  });

  //will loop until conditions for game is right and is started
  //tryStartGame(game);

  /*
    Serve images for our game
  */
  router.get('/images/:image',  (req, res, next) => {
    //console.log(path.resolve(__dirname, '../images'), __dirname, path.join(__dirname, '../images', req.params.image));
    const images  = path.join(path.dirname(fs.realpathSync(__filename)), '../images');
    res.sendFile(req.params.image, {root: images});
  });

  return router;
}

module.exports = memoryGame;
