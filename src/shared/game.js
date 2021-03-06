import EventEmitter from './eventEmitter';
import Player from './player';

class Game extends EventEmitter{
  constructor(){
    super();
    this.players = [];
    this.cards = [];

    this.currentTurn = null;
    this.firstCard = null;
    this.secondCard = null;
  }

  newGame() {
    if(this.players.length < 1){
      this.trigger('error', 'You need at least 1 player to start a game!');
      return;
    }

    this.resetGame();
    this.started = true;
    this.trigger('newGame');
    this.pickNextPlayer();
  }

  resetGame() {
    this.players.forEach(player => player.pairs = 0);
    this.cards.forEach(card => {
      card.found = false;
      card.flipped = false;
    });

    this.started = false;
    this.currentTurn = null;
    this.firstCard = null;
    this.secondCard = null;

    this.stopTurnTimeoutInterval();

    if(this.pickNextPlayerTimeout){
      clearTimeout(this.pickNextPlayerTimeout);
      this.pickNextPlayerTimeout = null;
    }

    this.trigger('status', 'Game Reset!');
    this.trigger('resetGame');
  }

  setCards(cards) {
    this.cards = [];
    cards.forEach((card, i) => {
      this.cards.push({
        index: i,
        name: card.name,
        src: card.src,
        flipped: card.flipped || false,
        found: card.found
      });
    });
    this.trigger('setCards', cards);
  }

  updateCard(newCard){
    let card = this.cards.find(card => {
      return newCard.index === card.index;
    });

    Object.assign(card, newCard);
    this.trigger('updateCard', newCard);
  }

  getCard(index){
    return this.cards[index];
  }

  updateCards(cards) {
    cards.forEach(card => {
      this.updateCard(card);
    });
  }

  getPairsLeft(){
    let pairsLeft = this.cards.length;
    this.cards.forEach(card => {
      if(card.found){
        pairsLeft--;
      }
    });
    pairsLeft /= 2;
    return pairsLeft;
  }

  getLeadingPlayerGuid(){
    return this.players.concat().sort((a, b) => {
      return a.pairs < b.pairs;
    })[0].guid;
  }

  flipCard(guid, index){
    const player = this.getPlayer(guid);

    if(!player){
      this.trigger('error', 'Player who tried to flip card doesnt exist!');
      return;
    }

    if(this.currentTurn != guid){
      this.trigger('error', 'player tried to flip card without it being their turn!');
      return;
    }

    const card = this.cards[index];

    if(!card){
      this.trigger('error', 'Card doesnt exist!');
      return;
    }

    if(card.flipped){
      this.trigger('error', 'player tried to flip card thats already flipped!');
      return;
    }

    if(card.found){
      this.trigger('error', 'player tried to flip card thats already found!');
      return;
    }

    if(this.firstCard !== null && this.secondCard !== null){
      this.trigger('error', 'This player already picked 2 cards!');
      return;
    }

    if(this.firstCard === null){
      this.firstCard = card.index;
      card.flipped = true;
    }else if(this.secondCard  === null){
      this.secondCard = card.index;
      card.flipped = true;
    }

    console.log('FlipCard', this.firstCard, this.secondCard);

    this.trigger('flipCard', player.guid, index);
    this.compareCards();
  }

  compareCards(){
    if(this.firstCard === null || this.secondCard === null){
      //this.trigger('error', 'You need to have picked 2 cards to be able to compare them!');
      return;
    }

    const player = this.getPlayer(this.currentTurn);

    const firstCard = this.getCard(this.firstCard),
          secondCard = this.getCard(this.secondCard);

    if(firstCard.name && firstCard.name === secondCard.name){
      //player scored
      firstCard.found = true;
      secondCard.found = true;

      console.log('FOUND PAIR', this.firstCard, this.secondCard);

      player.pairs++;

      this.trigger('foundPair', player.guid, [this.firstCard, this.secondCard]);
      this.stopTurnTimeoutInterval();
      if(this.getPairsLeft() === 0){
        this.started = false;
        this.trigger('status', 'Game completed!');
        this.trigger('gameFinished', this.getLeadingPlayerGuid());
      }

      //same player can pick cards again
      //this.trigger('flipCard', player.guid, index);
      this.nextTurn(this.currentTurn);
      return;
    }else{
      //wait a bit before we set next player
      this.stopTurnTimeoutInterval();
      this.trigger('status', 'Checkout the cards and remember them!');

      if(!this.compareCardsTimestamp){
        this.compareCardsTimestamp = Date.now() + 1000*3;
      }

      let timeleft = this.compareCardsTimestamp - Date.now();
      console.log(timeleft);

      this.pickNextPlayerTimeout = setTimeout(() => this.pickNextPlayer(), timeleft);
    }
  }

  addPlayer(player) {
    player = new Player(player);
    this.players.push(player);
    this.trigger('addPlayer', player);
    return player;
  }

  removePlayer(guid) {
    const playerIndex = this.players.findIndex(player => {return player.guid === guid});
    console.log('Removed Player', playerIndex, guid);
    const player = this.players[playerIndex];
    this.players.splice(playerIndex, 1);

    if(player && this.currentTurn === player.guid){
      if(this.players.length > 0){
        let nextGuid = this.players[(playerIndex+1) % this.players.length].guid;
        this.nextTurn(nextGuid);
      }else{
        this.started = false;
      }
    }

    this.trigger('removePlayer', guid);
  }

  updatePlayer() {

  }

  getPlayer(guid){
    return this.players.find(player => {return player.guid === guid});
  }

  pickNextPlayer(){
    const player = this.getPlayer(this.currentTurn);
    if(this.players.length > 0){
      const index = this.players.indexOf(player) + 1;
      const nextPlayer = this.players[index % this.players.length];
      this.nextTurn(nextPlayer.guid);
    }else{
      this.started = false;
    }
  }

  stopTurnTimeoutInterval(){
    if(this.nextTurnInterval){
      clearInterval(this.nextTurnInterval);
      this.nextTurnInterval = null;
    }
  }


//todo: make this a timeout and create the timer on client instead
  nextTurnTimeout(){
    if(!this.started){
      //should not do anything if theres no game going on!
      return;
    }

    this.nextTurnSecondsLeft = this.nextTurnSecondsLeft || Date.now() + 1000*20;

    if(this.nextTurnInterval){
      console.log('This interval should not exist!!!');
      this.stopTurnTimeoutInterval();
    }

    this.nextTurnInterval = setInterval(()=> {

      let secondsLeft = (this.nextTurnSecondsLeft - Date.now())/1000;

      this.trigger('status', 'Player got ' + Math.round( secondsLeft * 10 ) / 10 + ' seconds to pick 2 cards!');
      if(secondsLeft <= 0){
        clearInterval(this.nextTurnInterval);
        this.nextTurnInterval = null;
        this.pickNextPlayer();
      }


    }, 100*1);
  }

  nextTurn(guid) {
    //unflip cards whos pair are not found yet
    if(this.firstCard !== null && !this.getCard(this.firstCard).found){
      this.updateCard({
        index: this.firstCard,
        flipped: false
      });
    }

    if(this.secondCard !== null && !this.getCard(this.secondCard).found){
      this.updateCard({
        index: this.secondCard,
        flipped: false
      });
    }
    this.compareCardsTimestamp = null;
    this.firstCard = null;
    this.secondCard = null;
    this.currentTurn = guid;
    this.trigger('nextTurn', guid);
    this.nextTurnSecondsLeft = Date.now() + 1000*20;
    this.nextTurnTimeout();
  }


  getState() {
    return {
      started: this.started,
      nextTurnSecondsLeft: this.nextTurnSecondsLeft,
      compareCardsTimestamp: this.compareCardsTimestamp,
      firstCard: this.firstCard,
      secondCard: this.secondCard,
      currentTurn: this.currentTurn,
      players: this.players.map(player => {return player.getInfo(); }),
      cards: this.cards.map((card, i) => {
        return {
          index: i,
          name: card.flipped ? card.name : null,
          flipped: card.flipped,
          found: card.found,
          src: card.flipped ? card.src : '',
        };
      })
    }
  }

  setState(state) {
    this.started = state.started;
    this.nextTurnSecondsLeft = state.nextTurnSecondsLeft;
    this.compareCardsTimestamp = state.compareCardsTimestamp;

    this.currentTurn = state.currentTurn;

    this.players = state.players.map(player => {
      return new Player(player);
    });

    this.cards = state.cards.map(card => {
      return card;
    });

    this.firstCard = state.firstCard;
    this.secondCard = state.secondCard;

    this.compareCards();
    this.nextTurnTimeout();
    this.trigger('setState', state);
  }

}

export default Game;
