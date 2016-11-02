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

  getCard(index){
    return this.cards[index];
  }

  updateCards(cards) {
    cards.forEach(card => {
      this.updateCard(card);
    });
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

    if(this.firstCard !== null && this.secondCard !== null){
      const firstCard = this.getCard(this.firstCard),
            secondCard = this.getCard(this.secondCard);

      if(firstCard.name && firstCard.name === secondCard.name){
        //player scored
        firstCard.found = true;
        secondCard.found = true;

        console.log('FOUND PAIR', this.firstCard, this.secondCard);

        this.trigger('foundPair', player.guid, [this.firstCard, this.secondCard]);
        //same player can pick cards again
        this.trigger('flipCard', player.guid, index);
        this.nextTurn(this.currentTurn);
        return;
      }else{
        //wait a bit before we set next player
        this.trigger('wait', 'Waiting 4 seconds so everyone have time to see the cards!');
        setTimeout(()=> {
          if(this.players.length > 0){
            const index = this.players.indexOf(player) + 1;
            const nextPlayer = this.players[index % this.players.length];
            this.nextTurn(nextPlayer.guid);
          }else{
            this.started = false;
          }

        }, 4000);
      }
    }

    this.trigger('flipCard', player.guid, index);
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
      console.log('New turn player index', playerIndex, this.players.length, ((parseInt(playerIndex)+1) % this.players.length));
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

  nextTurn(guid) {
    //unflip cards whos pair are not found yet
    console.log('New TURN', this.firstCard, this.secondCard);
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

    this.firstCard = null;
    this.secondCard = null;
    console.log('Next Turn', guid);
    this.currentTurn = guid;
    this.trigger('nextTurn', guid);
  }


  getState() {
    return {
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
    this.firstCard = state.firstCard;
    this.secondCard = state.secondCard;
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
