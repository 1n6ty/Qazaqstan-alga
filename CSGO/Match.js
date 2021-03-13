const fs = require("fs");
const {Builder, By, until} = require('selenium-webdriver');
const { Options } = require("selenium-webdriver/chrome");

module.exports.Sessionv2 = class{

    rateTemp = {
        person: "XbXrt",
        circle: "_335FE",
        kills: "_2SMgu",
        assists: "_26k4_",
        deaths: "_1Fe8v",
        href: "_28EDA PitD0",
        clutches: "_3UOpu",
        multikills: "Ck42o",
        rounds: "_3kfeE",
    }

    constructor(path, estTime, fastCupPath, msgRegContext, tableContext, comment){
        this.file = JSON.parse(fs.readFileSync(path));
        this.path = path; // Path to data file
        this.tableContext = tableContext; // Context of table message to update info
        this.msgRegContext = msgRegContext; // Context of registration message to update info
        this.estTime = estTime; // Time to close the registration
        this.fastCupPath = fastCupPath; // Path to a match on fastcup service
        this.players = []; // Players are here
        this.comment = comment; //Comment for game;)
    }

    getEstTime(){return this.estTime;}
    getMsgId(){return this.msgRegContext.id;}
    getHref(){return this.fastCupPath;}
    isHere(playerId){
        if(this.players.filter(el => el == playerId).length == 0){
            return false;
        } else{
            return true;
        }
    }

    remove(playerId){
        this.players = this.players.map(v => {
            if(v != playerId){
                return v;
            }
        });
        console.log(`user has been removed ${this.players}`);
    }

    add(playerId){this.players.push(playerId);console.log(`user has been added ${this.players}`)}

    determinateTeams(idList){
        this.file = JSON.parse(fs.readFileSync(this.path));
        let teamA = {power: 0, team: []}, teamB = {power: 0, team: []};
        idList = idList.filter(v => v != undefined);
        let players = this.file.Players.map(e => {
            console.log(e.playerId, idList.filter(v => v == e.playerId).length, idList);
            if(idList.filter(v => v == e.playerId).length == 1){
                return e;
            }
        }).sort((a, b) => (b.rate1 + b.rate2 + b.rate3) / 3 - (a.rate1 + a.rate2 + a.rate3) / 3);
        if(players.length != 0){
            players.forEach(elem => {
                if(teamA.power >= teamB.power){
                    teamB.team.push(elem.nickName);
                    teamB.power += (elem.rate1 + elem.rate2 + elem.rate5) / 3;
                } else{
                    teamA.team.push(elem.nickName);
                    teamA.power += (elem.rate1 + elem.rate2 + elem.rate5) / 3;
                }
            });
        }
        return [teamA, teamB];
    }

    realId(fastCupId){
        this.file = JSON.parse(fs.readFileSync(this.path));
        console.log(this.file.Players.filter(v => v.fastCupId == fastCupId)[0]);
        let player = this.file.Players.filter(v => v.fastCupId == fastCupId)[0];
        return (player != undefined) ? player.playerId: undefined;
    }

    updatePlayer(playerId, mode, rate){ // Update rating of player
        this.file = JSON.parse(fs.readFileSync(this.path));
        this.file.Players = this.file.Players.map(e => {
            if(e.playerId == playerId){
                if(mode == 1){
                    e.rate1 = Math.floor((e.rate1 + rate) * 50) / 100;
                } else if(mode == 2){
                    e.rate2 = Math.floor((e.rate2 + rate) * 50) / 100;
                } else{
                    e.rate5 = Math.floor((e.rate5 + rate) * 50) / 100;
                }
            }
            return e;
        });
        this.file.Players = this.file.Players.sort((a, b) => (b.rate1 + b.rate2 + b.rate3) / 3 - (a.rate1 + a.rate2 + a.rate3) / 3);
        fs.writeFileSync(this.path, JSON.stringify(this.file));
    }

    async updateRate(){
        let flag = true,
            roundCount = 0;

        await this.driver.get(this.fastCupPath);
        await this.driver.wait(until.elementsLocated(By.className('_33aUm')), 2000);

        while(flag){
            try{
                if((await (await this.driver.findElement(By.className('_33aUm'))).getText()).includes("Didn't start") || (await (await this.driver.findElement(By.className('_33aUm'))).getText()).includes("Не состоялся")){
                    this.msgRegContext.delete();
                    return -1; 
                }
                await this.driver.wait(until.elementLocated(By.className('_2QNqw')), 1000);
                flag = false;
            } catch(e){}
        }
        for(let item of await this.driver.findElements(By.className(this.rateTemp.rounds))){
            roundCount += parseInt(await item.getText());
        }

        await this.driver.get(this.fastCupPath + "/stats");
        await this.driver.sleep(10000);
        await this.driver.wait(until.elementLocated(By.className('_1bmld')));

        console.log(`Count of rounds is ${roundCount}`);
        for(let item of (await this.driver.findElements(By.className(this.rateTemp.person))).filter((el, v) => v != 0 && v != 6)){
            let kills = parseInt(await (await item.findElement(By.className(this.rateTemp.kills))).getText()),
                deaths = parseInt(await (await item.findElement(By.className(this.rateTemp.deaths))).getText()),
                assists = parseInt(await(await item.findElement(By.className(this.rateTemp.assists))).getText()),
                href = /https\:\/\/csgo\.fastcup\.net\/(?:id)*(.*)/.exec((await (await item.findElement(By.className(this.rateTemp.href))).getAttribute('href')))[1],
                multikills = [], clutches = [];
            
            for(let i of await item.findElements(By.className(this.rateTemp.clutches))){
                clutches.push(parseInt(await i.getText()));
            }
            for(let i of await item.findElements(By.className(this.rateTemp.multikills))){
                multikills.push(parseInt(await i.getText()));
            }
            let rate = Math.round((((kills / roundCount) + (assists / roundCount) * 0.5 + 
                        0.7 * (roundCount - deaths) / roundCount + multikills.reduce((sum, cur, ind) => {
                            return sum += cur * (6 - ind) * (6 - ind);
                        }) / roundCount + clutches.reduce((sum, cur, ind) => {
                            return sum += cur * (7 - ind) * (7 - ind);
                        }) / roundCount) / 2.7) * 100) / 100; // Rate calculating
            console.log(rate, " - rate ", href);
            this.updatePlayer(this.realId(href), this.playersCount / 2, rate);
        }
        await this.driver.quit();
        console.log('Match is over');
        this.msgRegContext.delete();
        let table = `Place |      ID      | 5 vs 5 | 2 vs 2 | 1 vs 1 | Nickname\n`;
        this.file.Players.forEach((e, i) => {
            table += `---------------------------------------------------------------------------------\n${i + 1}        | ${e.fastCupId} | ${e.rate5}     | ${e.rate2}     | ${e.rate1}    | ${e.nickName} |\n`;
        });
        console.log(table);
        this.tableContext.edit(table);
        return 0;
    }

    async main(){
        let teams = [];
        this.driver = await new Builder().forBrowser('chrome').setChromeOptions(new Options().headless()).build(); // Selenium driver "Close after the rating function"
        await this.driver.get(this.fastCupPath);
        await this.driver.wait(until.elementLocated(By.className(this.rateTemp.circle)));
        this.playersCount = (await this.driver.findElements(By.className(this.rateTemp.circle))).length;
        console.log(`There are ${this.playersCount} players`);
        this.timerId = setInterval(() => {
            this.estTime -= 1000;
            console.log('one sec has been reduced');
            this.msgRegContext.edit(`| Открыта регистрация на матч ${this.playersCount / 2} на ${this.playersCount / 2} "${this.comment}":\nНажмите :white_check_mark: для добавления в матч (уберите, если передумали:wink:)\n\`\`\`css\n[Времени осталось: ${this.estTime / 1000} секунд]\n\`\`\``);
        }, 1000);
        setTimeout(() => {
            clearInterval(this.timerId);
            this.estTime = 0;
            console.log('Registration has been closed');
            teams = this.determinateTeams(this.players);
        }, this.estTime);
        while(this.estTime > 0){
            await this.driver.sleep(100);
        } 
        await this.msgRegContext.reactions.removeAll();
        this.msgRegContext.edit(`Матч ${this.fastCupPath} начался:military_helmet::\n| Команда № 1:\n\`\`\`css\n[${teams[0].team.join(', ')}]\n\`\`\`\n| Команда № 2:\n\`\`\`css\n[${teams[1].team.join(', ')}]\n\`\`\`\nУдачной игры:smile:`);
        return await this.updateRate();
    }

}