const fs = require('fs');

// Class about Player, methods to save, remove, change names, update rating, update place
module.exports.Players = class{

    constructor(path){
        this.file = JSON.parse(fs.readFileSync(path));
        this.path = path;
    }

    _savePlayer(playerId, fastCupId, rate5, rate2, rate1, place, nickname){ // Save new player to JSON
        this.file.Players.push({
            "playerId": playerId,
            "fastCupId": fastCupId,
            "place": place,
            "nickName": nickname,
            "rate5": rate5,
            "rate2": rate2,
            "rate1": rate1
        });
        fs.writeFileSync(this.path, JSON.stringify(this.file));
    }

    _placeUpdate(){ // Sorting players by middle of rate
        this.file.Players = this.file.Players.sort((a, b) => (b.rate1 + b.rate2 + b.rate3) / 3 - (a.rate1 + a.rate2 + a.rate3) / 3);
        fs.writeFileSync(this.path, JSON.stringify(this.file));
    }

    addPlayer(playerId, fastCupId, nickName){ // Call method to save to JSON
        if([...this.file.Players.filter(v => v.playerId == playerId || v.fastCupId == fastCupId)].length == 0){
            this._savePlayer(playerId, fastCupId, 1, 1, 1, this.file.Players.length, nickName);
            return 1;
        }else {
            return -1;
        }
    }

    changeName(playerId, nickNameNew){ // Change players name
        this.file.Players = this.file.Players.map(e => {
            if(e.playerId == playerId){
                e.nickName = nickNameNew;
                return e;
            } else{
                return e;
            }
        });
        this._placeUpdate();
    }

    removePlayer(playerId){ // Removing player from JSON 
        let nick = "";
        this.file.Players = this.file.Players.map(e => {
            if(e.playerId != playerId){
                return e;
            } else{
                nick = e.nickName;
            }
        });
        fs.writeFileSync(this.path, JSON.stringify(this.file));
        return nick;
    }
}

//{
//   "Players": [
//        {
//            "playerId": 123,
//            "fastCupId": 123,
//            "rate5": 123,
//            "rate2": 123,
//            "rate1": 123,
//            "nickname": "123",
//            "place": 1
//        }
//    ]
//}