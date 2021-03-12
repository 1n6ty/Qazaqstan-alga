const Discord = require('discord.js');
const client = new Discord.Client();
const {Players} = require("./Players");

var playersManager = new Players("../data.json");

client.on('ready', _ => {
    console.log("Client is ready");
});

client.on('message', msg => {
    if(msg.channel.id == "772692657620123658" && msg.author.id != "815215856237543434"){
        if(/-reg [0-9]{6} .*./.test(msg.content)){
            let arr = msg.content.match(/-reg ([0-9]{6}) (.*.)/);
            playersManager.addPlayer(msg.author.id, arr[1], arr[2]);
            //console.log(`Player ${arr[2]} with id - ${arr[1]} has been registred`);
            msg.reply(`${arr[2]} успешно зарегистрирован`).then(m => {
                setTimeout(() => {m.delete()}, 3000);
            });
        } else if(/-unreg/.test(msg.content)){
            let nick = playersManager.removePlayer(msg.author.id);
            //console.log("Player has been unregistred");
            msg.reply(`${nick} успешно удалён`).then(m => {
                setTimeout(() => {m.delete()}, 3000);
            });
        } else if(/-nick .*./.test(msg.content)){
            let arr = msg.content.match(/-nick (.*.)/);
            playersManager.changeName(msg.author.id, arr[1]);
            //console.log(`Player changed nick to ${arr[1]}`);
            msg.reply(`Успешно изменён nickname на ${arr[1]}`).then(m => {
                setTimeout(() => {m.delete()}, 3000);
            });
        }
        msg.delete();
    }
});

var joinChannel = "✨{₺01n2m∆k3!n3w!4∆nn3l}°",
    properGuilds = [
        {
            id: "674861916983787541", // id of category 
            channelName: "🎯Sib_Snip", // Name of channel
            reason: "Voice for playing Match Making 5",
            userLimit: 5,
        },
        {
            id: "819574173734797342",
            channelName: "🎯Sib_Snip",
            reason: "Voice for playing Match Making 2",
            userLimit: 2,
        },
        {
            id: "674503813889261579",
            channelName: "🔊 {vϙ1c3}",
            reason: "Comunity channels",
            userLimit: 0,
        }
    ];

client.on("voiceStateUpdate", (oldState, newState) => {
    properGuilds.forEach(v => {
        if(newState.channel !== null){
            if(v.id == newState.channel.parentID && newState.channel.name == joinChannel){
                //console.log("creating channel");
                newState.channel.guild.channels.create(v.channelName, {reason: v.reason, type: "voice", userLimit: v.userLimit}).then(el => {
                    el.setParent(v.id).then(element => {
                        newState.setChannel(element);
                    });
                });
            }
        }
        if(oldState.channel !== null){
            if(oldState.channel.name == v.channelName && oldState.channel.members.size == 0){
                oldState.channel.delete();
            }
        } 
    });
});

client.login(process.env.SECTOKEN);