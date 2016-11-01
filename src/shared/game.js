import EventEmitter from 'es6-event-emitter';
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
    this.trigger('setCards');
  }

  updateCard(newCard){
    let card = this.cards.find(card => {
      return newCard.index === card.index;
    });

    Object.assign(card, newCard);
    this.trigger('updateCard', newCard);
  }

  updateCards(cards) {
    cards.forEach(card => {
      this.updateCard(card);
    });
  }

  flipCard(player, index){
    if(this.currentTurn != player.guid){
      this.trigger('error', 'player tried to flip card without it being their turn!');
      return;
    }

    const card = this.cards[index];

    if(!card){
      this.trigger('error', 'Card doesnt exist!');
      return;
    }

    if(this.firstCard && this.secondCard){
      this.trigger('error', 'This player already picked 2 cards!');
      return;
    }

    if(!this.firstCard){
      this.firstCard = card;
    }else if(this.firstCard){
      this.secondCard = card;
    }

    if(this.firstCard && this.secondCard){
      if(this.firstCard.name === this.secondCard.name){
        //player scored
        this.firstCard.found = true;
        this.secondCard.found = true;

        this.trigger('foundPair', player, [this.firstCard, this.secondCard]);
      }


      const index = this.players.indexOf(player) + 1;
      const nextPlayer = this.players[index % this.players.length];
      this.nextTurn(nextPlayer.guid);
    }

    this.trigger('flipCard', card);
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
      this.nextTurn(this.players[(playerIndex+1) % this.players.length]);
    }

    this.trigger('removePlayer', guid);
  }

  updatePlayer() {

  }

  getPlayer(guid){
    return this.players.find(player => {return player.guid === guid});
  }

  nextTurn(guid) {
    console.log('Next Turn', guid);
    this.currentTurn = guid;
    this.trigger('nextTurn', guid);
  }


  getState() {
    return {
      currentTurn: this.currentTurn,
      players: this.players.map(player => {return player.getInfo(); }),
      cards: this.cards.map((card, i) => {
        return {
          index: i,
          name: card.flipped ? card.name : null,
          flipped: card.flipped,
          found: card.found
        };
      })
    }
  }

  setState(state) {
    this.currentTurn = state.currentTurn;

    this.players = state.players.map(player => {
      return new Player(player);
    });

    this.cards = state.cards.map(card => {
      return card;
    });

    this.trigger('setState', state);
  }

}

export default Game;
