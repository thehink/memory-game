import '../css/board.css';
import EventEmitter from '../shared/eventEmitter';
import DefaultImage from '../images/question-mark12.png';


class Board extends EventEmitter{
  constructor(el){
    super();
    this.el = el;
    this.el.classList.add('board');
    this.cardsEl = [];
  }

  updateCards(cards){
    cards.forEach(card => this.updateCard(card));
  }

  updateCard(card){
    const cardEl = this.cardsEl[card.index];

    if(card.flipped){
      cardEl.classList.add('flipped');
    }else{
      cardEl.classList.remove('flipped');
    }

    if(card.found){
      setTimeout(()=>cardEl.classList.add('found'), 600);
    }else{
      cardEl.classList.remove('found');
    }

    const back = cardEl.querySelector('.back');
    if(card.flipped && card.name){
      back.style.backgroundImage = 'url(' + card.src + ')';
    }else{
      //setTimeout(()=>back.style.backgroundImage = '', 600);
    }
  }

  renderCard(card){
    let cardElement = document.createElement('div');
    cardElement.className = 'card';

    let front = document.createElement('div');
    front.className = 'front';
    front.style.backgroundImage = 'url(' + DefaultImage + ')';

    let back = document.createElement('div');
    back.className = 'back';

    cardElement.appendChild(front);
    cardElement.appendChild(back);

    cardElement.addEventListener('click', (event) => {
      this.trigger('cardClicked', card.index);
    });
    return cardElement;
  }

  render(state, player) {
    this.cardsEl = [];
    this.el.innerHTML = '';

    if(player && player.guid === state.currentTurn){
      this.el.classList.add('my-turn'); //my turn
    }else if(player){
      this.el.classList.remove('my-turn');  //someone elses turn
    }

    state.cards.forEach((card, i) => {
      this.cardsEl[i] = this.renderCard(card);
      this.updateCard(card);
      this.el.appendChild(this.cardsEl[i]);
    });
    return this.el;
  }
}

export default Board;
