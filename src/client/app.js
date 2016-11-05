import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import '../css/style.css';
import Image from '../images/question-mark12.png';
import socket from 'socket.io-client/socket.io';


import Game from '../shared/game';
import Modal from './modal';
import Board from './board';
//import Players from './players';  todo: move out players gui stuff out of this file

class App {
  constructor() {
    this.board = new Board(document.querySelector('.game'));
    this.board.on('cardClicked', index => this.onCardClicked(index));

    this.player;
    const game = new Game();
    this.game = game;
    this.socket = socket();

    this.socket.on('disconnect', () => this.onDisconnect());

    this.socket.on('connect', () => {
      console.log('Connected');

      //Listen to server events
      this.socket.on('status', status => this.setStatus(status));
      this.socket.on('error', error => this.onError(error));
      this.socket.on('game_error', error => this.onError(error));
      //this.socket.on('game_error', error => {this.onGameError(error)});
      this.socket.on('joinGame', player => this.onJoinGame(player));
      //this.socket.on('leaveGame', player => this.onLeaveGame(player));

      this.socket.on('addPlayer', player => this.game.addPlayer(player));
      this.socket.on('removePlayer', player => this.game.removePlayer(player));
      this.socket.on('updatePlayer', player => this.game.updatePlayer(player));
      //this.socket.on('nextTurn', guid => this.game.nextTurn(guid));
      //server will send complete card data when flipping a card
      this.socket.on('updateCard', card => this.game.updateCard(card));
      this.socket.on('flipCard', cardData => this.game.flipCard(cardData.guid, cardData.index));
      this.socket.on('newGame', () => this.game.newGame());
      this.socket.on('resetGame', () => this.game.resetGame());
      this.socket.on('setCards', cards => this.game.setCards(cards));
      this.socket.on('gameState', state => this.game.setState(state));
    });

    //Listen to game events and modify gui accordingly
    game.on('status', status => this.setStatus(status));
    game.on('error', error => this.onGameError(error));
    game.on('gameFinished', guid => this.onGameFinished(guid));
    game.on('addPlayer', player => this.onAddPlayer(player));
    game.on('removePlayer', guid => this.onRemovePlayer(guid));
    game.on('updatePlayer', player => this.onUpdatePlayer(player));
    game.on('nextTurn', guid => this.onNextTurn(guid));
    game.on('flipCard', (guid, index) => this.onFlipCard(guid, index));
    game.on('foundPair', (guid, cards) => this.onFoundPair(guid, cards));

    game.on('newGame', () => this.onNewGame());
    game.on('resetGame', () => this.onResetGame());

    game.on('setCards', cards => this.onSetCards(cards));
    game.on('setState', state => this.onSetState(state));

    if(localStorage.getItem('guid')){
      this.tryJoinGame(localStorage.getItem('name'));
    }

    //document.body.addEventListener('mousemove', event => this.onMouseMovement(event));
    this.addControlButtonListeners();
  }

  onMouseMovement(event){
    const pointer = document.getElementById('pointer');
    pointer.style.left = event.clientX + 'px';
    pointer.style.top = event.clientY + 'px';
  }

  addControlButtonListeners(){
    document.querySelector('#start_button').addEventListener('click', e => {
      console.log('Sending New Game request!');
      this.socket.emit('requestNewGame');
    });

    document.querySelector('#reset_button').addEventListener('click', e => {
      console.log('Sending Reset Game request!');
      this.socket.emit('requestResetGame');
    });

    document.querySelector('#join_button').addEventListener('click', e => {
      if(this.player){
        this.tryLeaveGame();
      }else{
        const input = document.createElement('input');
        input.type = 'text';
        input.value = localStorage.getItem('name') || '';

        const modalForm = new Modal('Enter Username', input);

        input.focus();

        modalForm.addButton('Join', 'green',  () => {
          this.tryJoinGame(input.value);
          return true;
        });
        modalForm.addButton('Cancel', 'red', () => true);
      }
    });
  }

  tryLeaveGame(){
    this.socket.emit('leave');
  }

  tryJoinGame(name){
    this.socket.emit('join', {
      name: name,
      guid: localStorage.getItem('guid')
    });
  }

  onLeaveGame(){
    this.player = null;
    localStorage.removeItem('guid');
    document.querySelector('#join_button').innerText = 'Join Game';
  }

  onJoinGame(player){
    this.setStatus('Joined Game!');
    document.querySelector('#join_button').innerText = 'Leave Game';
    this.player = player;
    localStorage.setItem('guid', player.guid);
    localStorage.setItem('name', player.name);

    if(this.player && this.player.guid === this.game.currentTurn){
      document.querySelector('.game').classList.add('my-turn'); //my turn
    }else{
      document.querySelector('.game').classList.remove('my-turn');  //someone elses turn
    }
  }


  onDisconnect(){
    this.player = null;
    this.setStatus('Disconnected!');
  }

  onGameFinished(guid){
    //todo: show a leaderboard with all the players

    const listEl = document.createElement('ul');
    listEl.className = 'scoreboard';

    const sortedByPairs = this.game.players.concat().sort((a, b) => {
      return a.pairs < b.pairs;
    });

    sortedByPairs.forEach(player => {
      const itemEl = document.createElement('li');
      itemEl.innerText = `${player.name} with ${player.pairs} pairs!`;
      listEl.appendChild(itemEl);
    });

    let modalForm = new Modal('Scoreboard', listEl);
    modalForm.addButton('Ok', 'green', () => true);
  }

  onNewGame() {
    console.log('Starting new game!');
    this.render();
  }

  onResetGame() {
    console.log('Reset game!');
    this.render();
  }

  setStatus(status) {
    document.querySelector('#status').innerText = status;
  }

  onError(error){
    console.log('Socket_ERROR', error);
    this.setStatus('Error: ' + error);
  }

  onGameError(error){
    console.log('GAME_ERROR', error);
    //this.setStatus(error);
  }

  onCardClicked(index){
    const card = this.game.getCard(index);
    if(this.player && this.game.currentTurn === this.player.guid && !card.flipped){
      //console.log('PickedCard', this.game, card);
      if(this.game.firstCard !== null){
        document.querySelector('.game').classList.remove('my-turn');
      }
      this.socket.emit('flipCard', card.index);
    }
  }

  onFlipCard(guid, index){
    const card = this.game.getCard(index);
    this.board.updateCard(card);
    console.log('OnFlipCard', index);
  }

  onNextTurn(guid) {
    const playerEl = document.querySelector('.current');
    if(playerEl){
      playerEl.classList.remove('current');
    }

    document.querySelector('#player_'+guid).classList.add('current');

    if(this.player && this.player.guid === guid){
      document.querySelector('.game').classList.add('my-turn'); //my turn
    }else{
      document.querySelector('.game').classList.remove('my-turn');  //someone elses turn
    }

    this.board.updateCards(this.game.getState().cards);
  }

  onSetState(state){
    console.log('Got new state, rerender everything!');
    this.render();
  }

  onSetCards(){
    const state = this.game.getState();
    this.board.render(state);
  }

  onFoundPair(guid, cards){
    cards.forEach(index => {
      this.board.updateCard(this.game.getCard(index));
    });

    const player = this.game.getPlayer(guid);
    const playerEl = document.querySelector('#player_'+guid+' > .pairs');
    playerEl.innerText = 'Pairs: ' + player.pairs;
  }

  onUpdatePlayer(player) {
    //update player
  }

  onRemovePlayer(guid) {
    if(this.player && this.player.guid === guid){
        this.onLeaveGame();
    }

    //add player from gui
     const playerEl = document.querySelector('#player_'+guid);
     if(playerEl){
       playerEl.remove();
     }
  }

  onAddPlayer(player) {
    //add player to gui
    const state = this.game.getState();

    const selector = document.querySelector('.players');
    const playerElement = this.buildPlayerElement(state, player);
    selector.appendChild(playerElement);
  }

  buildPlayerElement(state, player){
    let playerElement = document.createElement('div');
    playerElement.className = 'player';
    playerElement.id = 'player_' + player.guid;
    if(state.currentTurn === player.guid){
      playerElement.classList.add('current');
    }

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
    pairs.innerText = 'Pairs: ' + player.pairs;

    playerElement.appendChild(profile);
    playerElement.appendChild(pairs);
    return playerElement;
  }

  renderPlayers(state) {
    const selector = document.querySelector('.players');
    selector.innerHTML = '';

    state.players.forEach(player => {
      let playerElement = this.buildPlayerElement(state, player);
      selector.appendChild(playerElement);
    });
  }

  render() {
    const state = this.game.getState();

    this.board.render(state);
    this.renderPlayers(state);
  }
}

export default new App();
