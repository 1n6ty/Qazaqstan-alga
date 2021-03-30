const Discord = require('discord.js');
const client = new Discord.Client();
const {Sessionv2} = require('./Match');

var order = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!, `, process.memoryUsage().heapUsed / 1024 / 1024, ' MB');
    
});

client.on('message', msg => {
    if(msg.content.match(/-csgo *https\:\/\/csgo\.fastcup\.net\/match[0-9]{7}/)){
        if(msg.channel.id == "805419223333208114"){
            let reg = /-csgo *(https\:\/\/csgo\.fastcup\.net\/match[0-9]{7}) *([0-9]{1,2}) *(.*)/.exec(msg.content);
                estTime = parseInt((reg[2]) ? reg[2]: 1) * 60000;
                href = reg[1],
                comment = (reg[3]) ? reg[3]: "";
            if(order.filter(el => el.getHref() == href).length == 0){
                msg.reply(`Матч #${order.length + 1} создан.`);
                client.channels.fetch('812291904653361162').then(channel => {
                    channel.send('CS:GO').then(m => {
                        client.channels.fetch('772692657620123658').then(cs => {
                            cs.messages.fetch('826485650861719593').then(table => {
                                m.react('✅');
                                order.push(new Sessionv2('../data.json', estTime, href, m, table, comment));
                                order[order.length - 1].main().then(v => {
                                    order.pop();
                                });
                            });
                        });
                    });
                });
            } else{
                msg.reply("Такой матч уже есть!!!");
            }
        }
    }
});

client.on("messageReactionAdd", (reaction, user) => {
    if(reaction.emoji.name == '✅' && order.filter(el => el.isHere(user.id)).length == 0 && user.id != "681917719981064287"){
        order = order.map(el => {
            if(el.getMsgId() == reaction.message.id && el.getEstTime() != 0){
                el.add(user.id);
            }
            return el;
        });
    }
});

client.on("messageReactionRemove", (reaction, user) => {
    if(reaction.emoji.name == '✅'){
        order = order.map(el => {
            if(el.getMsgId() == reaction.message.id && el.getEstTime() != 0){
                el.remove(user.id);
            }
            return el;
        });
    } 
});

client.login(process.env.CSTOKEN);