//very simple event emitter

class EventEmitter{
  constructor(){
    this.listeners = {};
  }

  trigger(action){
    if(!this.listeners[action]){
      return;
    }

    this.listeners[action].forEach(callback => {
      const args = [...arguments].slice(1,arguments.length);
      callback(...args);
    });
  }

  on(action, callback){
    if(!this.listeners[action]){
      this.listeners[action] = [];
    }

    this.listeners[action].push(callback);
  }
}

export default EventEmitter;
