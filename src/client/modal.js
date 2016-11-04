import '../css/modal.css';

class Modal{
  constructor(title, el){
    this.el = document.createElement('div');
    this.el.className = 'modal-wrapper';

    this.el.addEventListener('click', (e) => {
      if(e.target.className === 'modal-wrapper'){
        this.destroy();
      }
    });

    const modal = document.createElement('div');
    modal.className = 'modal';

    const headerEl = document.createElement('div');
    headerEl.className = 'header';
    headerEl.innerText = title;

    const contentEl = document.createElement('div');
    contentEl.className = 'content';
    contentEl.appendChild(el);

    const footerEl = document.createElement('div');
    footerEl.className = 'footer';

    modal.appendChild(headerEl);
    modal.appendChild(contentEl);
    modal.appendChild(footerEl);

    this.el.appendChild(modal);

    document.body.appendChild(this.el);
  }

  addButton(text, className, callback){
    const button = document.createElement('button');
    button.innerText = text;
    button.className = className;

    button.addEventListener('click', (e) => {callback(e) ? this.destroy() : null});
    this.el.querySelector('.footer').appendChild(button);
  }

  getElement(){
    return this.el;
  }

  destroy(){
    this.el.remove();
  }



}


export default Modal;
