
class Player{
  constructor(player){
    this.guid = player.guid;
    this.name = player.name;
    this.color = player.color;
    this.pairs = [];
    this.totalPoints = [];
    this.socket = player.socket;
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
  }

}
