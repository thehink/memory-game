import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import '../css/style.css';
import Image from '../images/question-mark12.png';
import socket from 'socket.io-client/socket.io';

import Game from '../shared/game';


class App {
  constructor() {
    //this.game = new Game(state);

    this.player;
    const game = new Game();
    this.game = game;
    this.socket = socket();

    this.socket.on('connect', () => {
      console.log('Connected');

      this.socket.emit('auth', {
        username: 'blablabla'
      });

      this.socket.on('error', this.onError);
      this.socket.on('authSuccess', this.onAuthorized);
      this.socket.on('addPlayer', game.addPlayer);
      this.socket.on('removePlayer', game.removePlayer);
      this.socket.on('updatePlayer', game.updatePlayer);
      this.socket.on('nextTurn', game.nextTurn);
      this.socket.on('checkCard', game.checkCard);
      this.socket.on('foundPair', game.foundPair);
      this.socket.on('gameState', game.setState);
    });

    game.on('addPlayer', this.onAddPlayer);
    game.on('removePlayer', this.onRemovePlayer);
    game.on('updatePlayer', this.onUpdatePlayer);
    game.on('nextTurn', this.onNextTurn);
  }

  onAuthorized(player){
    this.player = player;
  }

  onNextTurn(guid) {
    if(this.player.guid === guid){
      //my turn
    }else{
      //someone elses turn
    }
  }

  onState(state){

  }

  onFoundPair(pair){

  }

  onCheckCard(card) {
    //card.index
    //card.name
    //card.src
    //fill card data in game and flip it in UI
  }

  onUpdatePlayer(player) {
    //update player
  }

  onRemovePlayer(player) {
    //add player from gui
  }

  onAddPlayer(player) {
    //add player to gui
  }

  onError(error){
    console.log('Socket_ERROR', error);
  }

  renderPlayers() {

  }

  renderBoard() {
    const selector = document.querySelector('.game');
    selector.innerHTML = '';

    const state = this.game.getState();

    state.board = [1,2,3,4,5,6,7,8];

    state.board.forEach(card => {
      let cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.style.backgroundImage = 'url(' + Image + ')';
      cardElement.style.backgroundSize = '100%';

      let icon = document.createElement('img');
      icon.src = Image;

      //cardElement.appendChild(icon);

      cardElement.addEventListener('click', (event) => {
        console.log('asd', event);
        event.target.classList.toggle('flipped');
      });

      selector.appendChild(cardElement);
    });
  }

  render() {
    this.renderBoard();
  }
}

export default new App();
