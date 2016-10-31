import EventEmitter from 'event-emitter';

class game extends EventEmitter {
  constructor (state){
    this.state = Object.assign({
      players: [],
      board: []
    }, state);

    this.socket = '';
  }

  setSate(state){
    this.state = Object.assign({}, this.state, state);
  }

  checkCard(index, card){

  }

  addPlayer(){

  }

  removePlayer(){

  }

  getState() {
    return this.state;
  }
}
