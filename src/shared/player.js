
class Player{
  constructor(player){
    this.guid = player.guid;
    this.name = player.name;
    this.color = player.color;
    this.pairs = 0;
    this.totalPoints = 0;
  }

  getInfo(){
    return {
      guid: this.guid,
      name: this.name,
      color: this.color,
      pairs: this.pairs,
      totalPoints: this.totalPoints
    }
  }

}

export default Player;
