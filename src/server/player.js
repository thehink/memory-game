
class Player{
  constructor(player){
    this.guid = player.guid;
    this.name = player.name;
    this.color = player.color;
    this.pairs = [];
    this.totalPoints = 0;
    this.newConnection(player.socket);
  }

  isConnected(){
    if(this.socket && this.socket.connected){
      return true;
    }
    return false;
  }

  newConnection(socket){
    if(this.socket && this.socket.connected){
      this.socket.disconnect();
    }
    this.socket = socket;

    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('checkCard', this.onCheckCard);
  }

  onDisconnect(){

  }

  onCheckCard(){

  }

  getInfo(){
    return {
      guid: this.guid,
      name: this.name,
      color: this.color,
      pairs: this.pairs,
      points: this.totalPoints
    }
  }

}
