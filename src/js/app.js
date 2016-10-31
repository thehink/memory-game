import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import '../css/style.css';
import Image from '../images/question-mark12.png';
import socket from 'socket.io-client/socket.io';

import Game from './game';

let state = {
  guid: null || localStorage.getItem("guid"),
  players: [],
  board: []
};

class App {
  constructor() {
    //this.game = new Game(state);
    
    this.socket = socket();

    this.socket.on('connect', () => {
      console.log('Connected');
      this.socket.emit('message', 'Hello!');
    });
  }

  renderPlayers() {

  }

  renderBoard() {

  }

  render() {
    const selector = document.querySelector('.game');
    const children = document.querySelectorAll('.game > *');

    children.forEach(node => {
      node.remove();
    });

    for(let i = 0; i < 16; ++i){
      let card = document.createElement('div');
      card.className = 'card';

      let icon = document.createElement('img');
      icon.src = Image;

      card.appendChild(icon);

      selector.appendChild(card);
    }
  }
}

export default new App();
