const express = require('express');
const Guid = require('guid');
const fs = require('fs');
const path = require('path');

import Game from '../shared/game';
import asdasd from '../cards.json';
const Cards = typeof asdasd === "string" ? JSON.parse(fs.readFileSync(asdasd, 'utf8')) : asdasd;

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


const memoryGame = (io) => {
  const router = express.Router();
  const game = new Game();
  game.setCards(getRandomCards());

  game.on('error', error => {
    console.log('Error', error);
  });

  game.on('addPlayer', player => {
    io.emit('addPlayer', player);
  });

  game.on('removePlayer', guid => {
    io.emit('removePlayer', guid);
  });

  game.on('updatePlayer', player => {
    io.emit('updatePlayer', player);
  });

  game.on('nextTurn', guid => {
    io.emit('nextTurn', guid);
  });

  game.on('foundPair', (guid, cards) => {
    io.emit('foundPair', {guid:guid, cards:cards});
  });

  game.on('flipCard', (guid, index) => {
    const card = game.getCard(index);

    //make client aware of card contents
    io.emit('updateCard', card);

    //flip card on client
    console.log('FlipCard', {guid: guid, index: card.index});
    io.emit('flipCard', {guid: guid, index: card.index});
  });

  game.on('wait', text => {
    io.emit('status', text);
  });

  game.on('gameFinished', player => {
    console.log('Game finished!');
  });

  io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('status', 'Connected...');

    socket.on('flipCard', index => {
      if(!socket.player){
        return;
      }

      console.log('Player tried to flip card', index);
      const player = socket.player;
      game.flipCard(player.guid, index);
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

  /*

  GAME LOOP

  */
  setInterval(()=> {
    if(game.players.length < 2){
      io.emit('status', 'Not enough players!');
      return;
    }

    if(!game.started){
      game.started = true;
      io.emit('status', 'Starting new game...');
      game.setCards(getRandomCards());
      io.emit('gameState', game.getState());
      game.nextTurn(game.players[0].guid);
    }

    let pairsLeft = game.cards.length;
    game.cards.forEach(card => {
      if(card.found){
        pairsLeft--;
      }
    })
    pairsLeft /= 2;

    //io.emit('status', 'Pairs left... ' + pairsLeft);


  }, 3000);

  /*
    Serve images for our game
  */
  router.get('/images/:image',  (req, res, next) => {
    res.sendFile(path.join(__dirname, '../images', req.params.image));
  });

  return router;
}

module.exports = memoryGame;
