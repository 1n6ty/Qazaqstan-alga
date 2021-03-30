const Discord = require('discord.js');
const client = new Discord.Client();
const {Players} = require("./Players");

var playersManager = new Players("../data.json"),
    tableContext;

client.on('ready', _ => {
    console.log("Client is ready");
    client.channels.fetch("821765248666697808").then(channel => {
        channel.send('Table of Players').then(m => {
            tableContext = m;
        });
    });
});

client.on('message', msg => {
    if(msg.channel.id == "821765248666697808" && msg.author.id != "815215856237543434"){
        if(/-reg/.test(msg.content)){
            playersManager.addPlayer(msg.author.id, msg.author.username);
            console.log(`Player ${msg.author.username} with id - ${msg.author.id} has been registred`);
        } else if(/-unreg/.test(msg.content)){
            playersManager.removePlayer(msg.author.id);
            console.log(`Player ${msg.author.username} has been unregistred`);
        } else if(/-csgo *([0-9]{6})/.test(msg.content)){
            let arr = /-csgo *(\d{6})/.exec(msg.content);
            playersManager.csgoReg(msg.author.id, arr[1]);
            let role = msg.member.guild.roles.cache.find(role => role.name === "cs:go");
            if (role) msg.guild.members.cache.get(msg.author.id).roles.add(role);
        } else if(/-uncsgo/.test(msg.content)){
            playersManager.csgoUnreg(msg.author.id);
            let role = msg.member.guild.roles.cache.find(role => role.name === "cs:go");
            if (role) msg.guild.members.cache.get(msg.author.id).roles.remove(role);
        }
        playersManager.setTable(tableContext);
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