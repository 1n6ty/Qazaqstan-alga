const fs = require('fs');

// Class about Player, methods to save, remove, change names, update rating, update place
module.exports.Players = class{

    constructor(path){
        this.file = JSON.parse(fs.readFileSync(path));
        this.path = path;
    }

    async setTable(tableContext){
        let str = "nick | csgo\n";
        for(let i of this.file.Players){
            str += "------------------------------------------------------------------------------\n";
            str += `${(await tableContext.client.users.fetch(i.playerId)).username} | ${(i.csgo !== undefined) ? '✅': '❎'}\n`; 
        }
        console.log(str);
        await tableContext.edit(str);
    }

    addPlayer(playerId, nick){
        if(this.file.Players.filter(v => v.playerId == playerId).length == 0){
            this.file.Players.push({
                "playerId": playerId,
                "nick": nick
            });
            fs.writeFileSync(this.path, JSON.stringify(this.file));
            return 1;
        }else {
            return -1;
        }
    }

    csgoReg(playerId, fastCupId){
        this.file.Players.forEach(element => {
            if(element.playerId == playerId){
                if(element.csgo === undefined){
                    element["csgo"] = {
                        "fastCupId": fastCupId,
                        "rate1": 1,
                        "rate2": 1,
                        "rate5": 1,
                        "place": "n"
                    };
                    fs.writeFileSync(this.path, JSON.stringify(this.file));
                    return 0;
                } else{
                    return -1;
                }
            }
        });
    }

    csgoUnreg(playerId){
        this.file.Players = this.file.Players.map(e => {
            if(e.playerId == playerId){
                e.csgo = undefined;
            }
            return e;
        });
        fs.writeFileSync(this.path, JSON.stringify(this.file));
    }

    removePlayer(playerId){ // Removing player from JSON 
        this.file.Players = this.file.Players.map(e => {
            if(e.playerId != playerId){
                return e;
            }
        }).filter(el => el !== undefined);
        fs.writeFileSync(this.path, JSON.stringify(this.file));
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