import EventEmitter from 'es6-event-emitter';
import Player from './player';

class Game extends EventEmitter{
  constructor(){
    super();
    this.state = {
      players: [],
      board: []
    }
  }

  addPlayer(player) {
    player = new Player(player);
    this.state.players.push(player);
    this.trigger('addPlayer', player);
  }

  removePlayer(player) {
    const playerIndex = this.state.players.indexOf(player);
    this.state.players.splice(playerIndex, 1);
    this.trigger('removePlayer', player);
  }

  updatePlayer() {

  }

  nextTurn() {

  }

  getState() {
    return this.state;
  }

  setState(state) {
    Object.assign(this.state, state);
    this.trigger('setState', this.getState());
  }

}

export default Game;
