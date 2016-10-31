'use strict';


/*
<div class="card">
  <i class="fa fa-question"></i>
</div>
*/


const selector = document.querySelector('.game');


for(let i = 0; i < 20; ++i){
  let card = document.createElement('div');
  card.className = 'card';

  let icon = document.createElement('i');
  icon.className = 'fa fa-question';

  card.appendChild(icon);

  selector.appendChild(card);
}
