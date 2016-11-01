import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import '../css/style.css';
import Image from '../images/question-mark12.png';
import socket from 'socket.io-client/socket.io';

import Game from '../shared/game';

const WebBrowser = (() => {
  var ua= navigator.userAgent, tem,
  M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
      tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE '+(tem[1] || '');
  }
  if(M[1]=== 'Chrome'){
      tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
      if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
  return M.join(' ');
})();

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
        name: WebBrowser,
        guid: localStorage.getItem('guid')
      });

      this.socket.on('status', status => {this.setStatus(status)});
      this.socket.on('error', error => {this.onError(error)});
      this.socket.on('game_error', error => {this.onGameError(error)});
      this.socket.on('authSuccess', player => {this.onAuthorized(player)});
      this.socket.on('addPlayer', player => {this.game.addPlayer(player)});
      this.socket.on('removePlayer', player => {this.game.removePlayer(player)});
      this.socket.on('updatePlayer', player => {this.game.updatePlayer(player)});
      this.socket.on('nextTurn', guid => {this.game.nextTurn(guid)});
      this.socket.on('updateCard', card => {this.game.updateCard(card)});
      this.socket.on('foundPair', cards => {this.game.updateCards(cards)});
      this.socket.on('gameState', state => {this.game.setState(state)});
    });

    game.on('addPlayer', player => {this.onAddPlayer(player)});
    game.on('removePlayer', guid => {this.onRemovePlayer(guid)});
    game.on('updatePlayer', player => {this.onUpdatePlayer(player)});
    game.on('nextTurn', guid => {this.onNextTurn(guid)});
    game.on('updateCard', card => {this.onUpdateCard(card)});
    game.on('setState', state => {this.onSetState(state)});
  }

  setStatus(status) {
    document.querySelector('#status').innerText = status;
  }

  onError(error){
    console.log('Socket_ERROR', error);
    this.setStatus(error);
  }

  onGameError(error){
    this.setStatus(error);
  }

  onCardClicked(cardElement, card){
    if(this.game.currentTurn === this.player.guid && !card.flipped){
      cardElement.classList.add('flipped');
      this.socket.emit('flipCard', card.index);
    }

  }

  onUpdateCard(card){
    //get card by id && and flip card
    //cardElement.classList.add('flipped');
    console.log('UpdateCARD', card);
    this.renderBoard(); //rerender whole board. Should just toggle classes in the future
  }

  onAuthorized(player){
    this.player = player;
    localStorage.setItem('guid', player.guid);
  }

  onNextTurn(guid) {
    if(this.player.guid === guid){
      //my turn
      document.querySelector('.game').classList.add('my-turn');
    }else{
      //someone elses turn
      document.querySelector('.game').classList.remove('my-turn');
    }
  }

  onSetState(state){
    this.render();
  }

  onFoundPair(pair){

  }

  onUpdatePlayer(player) {
    //update player
  }

  onRemovePlayer(guid) {
    //add player from gui
     document.querySelector('#player_'+guid).remove();
  }

  onAddPlayer(player) {
    //add player to gui
    const selector = document.querySelector('.players');
    const playerElement = this.buildPlayerElement(player);
    selector.appendChild(playerElement);
  }

  buildPlayerElement(player){
    let playerElement = document.createElement('div');
    playerElement.className = 'player';
    playerElement.id = 'player_' + player.guid;

    let profile = document.createElement('div');
    profile.className = 'profile';

    let icon = document.createElement('i');
    icon.className = 'fa fa-user';

    let name = document.createElement('span');
    name.className = 'name';
    name.innerText = player.name;

    profile.appendChild(icon);
    profile.appendChild(name);

    let pairs = document.createElement('div');
    pairs.className = 'pairs';
    pairs.innerText = 'Pairs: 4';

    playerElement.appendChild(profile);
    playerElement.appendChild(pairs);
    return playerElement;
  }

  renderPlayers(state) {
    const selector = document.querySelector('.players');
    selector.innerHTML = '';

    state.players.forEach(player => {
      let playerElement = this.buildPlayerElement(player);
      selector.appendChild(playerElement);
    });
  }

  renderBoard(state) {
    const selector = document.querySelector('.game');
    selector.innerHTML = '';

    if(this.player && state.currentTurn === this.player.guid){
      selector.classList.add('my-turn');
    }else{
      selector.classList.remove('my-turn');
    }

    state.cards.forEach(card => {
      let cardElement = document.createElement('div');
      cardElement.className = 'card';

      if(card.flipped){
        cardElement.classList.add('flipped');
      }

      if(card.found){
        cardElement.classList.add('found');
      }

      let front = document.createElement('div');
      front.className = 'front';
      front.style.backgroundImage = 'url(' + Image + ')';

      let back = document.createElement('div');
      back.className = 'back';

      if(card.flipped && card.name){
        back.style.backgroundImage = 'url(' + card.src + ')';
      }

      cardElement.appendChild(front);
      cardElement.appendChild(back);

      cardElement.addEventListener('click', (event) => {
        this.onCardClicked(cardElement, card);
      });

      selector.appendChild(cardElement);
    });
  }

  render() {
    const state = this.game.getState();
    console.log(state);

    this.renderBoard(state);
    this.renderPlayers(state);
  }
}

export default new App();
