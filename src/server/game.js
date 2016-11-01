import EventEmitter from 'event-emitter';
import Cards from '../cards.json';

const pairs = 10;

class Game{
  constructor(io){
    this.io = io;
    this.players = [];
    this.board = [];

    this.active = false;

    this.firstCard = null;
    this.secondCard = null;

    this.gameLoopInterval = setInterval(this.gameLoop, 1000);
  }

  addPlayer(player){
    this.players.push(player);
    this.io.emit('newPlayer', player.getInfo());
  }

  removePlayer(){

  }

  getPlayers(){

  }

  getActivePlayers(){

  }

  getBoard() {

  }

  newGame(pairs){
    this.board = [];

//randomize card list
    Cards.sort((a,b) => {
      return 0.5 - Math.random();
    });

//select cards
    for(let i = 0; i < pairs; ++i){
      const card = Cards[Math.floor(i/2)];
      this.board.push({
        card: card.name,
        found: false
      })
    }

//randomize selected cards
    this.board.sort((a,b) => {
      return 0.5 - Math.random();
    });


    this.currentTurn = 0;
    this.active = true;
    this.io.emit('newGameStarted', {});
  }

  checkCard(player, index){
    if(this.players.indexOf(player) === this.currentTurn){
      player.socket.emit('error', 'This player is not in the game!');
      return;
    }

    const card = this.board[index];
    if(!card){
      player.socket.emit('error', 'The card you selected doesnt exist!');
      return;
    }

    if(this.firstCard){
      this.secondCard = card;
      if(this.firstCard === this.secondCard){
        this.playerFoundPair();
      }
    }else{
      this.io.emit('checkCard', {index: index, name: card.name});
      this.firstCard = card;
    }
  }

  playerFoundPair(){
    const player = this.players[this.currentTurn];
    this.io.emit('foundPair', {
      player: player.guid,
      pair: [this.firstCard, this.secondCard]
    });

    this.board.map((card) => {
      if(card.name === this.firstCard.name){
        card.found = true;
      }
    });
  }

  nextTurn() {
    this.currentTurn++;
    this.currentTurn %= this.players.length;
  }

  gameLoop(){
    if(this.players.length < 1){
      this.io.emit('status', 'Not enough players!')
      return;
    }

    if(!this.active){
      this.newGame();
    }
  }

  setSate(state){
    this.state = Object.assign({}, this.state, state);
  }

  getBoard(){
    return this.board.map(card => {
      let newCard = {};

      if(card.found){
        newCard.name = card.name;
      }

      newCard.found = card.found;
      return newCard;
    });
  }

  getState(){
    return {
      board: this.getBoard()
    };
  }
}

export default Game;
