const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const fs = require("fs");
const invites = {};
bot.commands = new Discord.Collection();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB, { useNewUrlParser: true });
let User = require("./models/user.js");
User.findOrCreate = async function(guild, user) {
    let resUser = await this.findOne({guildID: guild.id, userID: user.id})
    if (!resUser) {
      resUser = new User({
        guildID: guild.id, 
        userID: user.id,
        tag: user.tag
      })
      await resUser.save()
    }
    return resUser
  }
const rewards = [
    {name:"Inviter Role", type: "role", invites: "1", role:"Inviter"},
    {name:"1 Level", type: "levels", invites: "2", levels:1},
    {name:"3 Levels", type: "levels", invites: "5", levels:3},
    {name:"Inviter+ Role", type: "role", invites: "5", role:"Inviter+"},
    {name:"5 Levels", type: "levels", invites: "8", levels:5},
    {name:"Epic Inviter Role", type: "role", invites: "10", role:"Epic Inviter"},
    {name:"10 Levels", type: "levels", invites: "15", levels:10},
    {name:"Super Inviter Role", type: "role", invites: "15", role:"Super Inviter"},
    {name:"Invite Master Role", type: "role", invites: "30", role:"Invite Master"}
]
module.exports.rewards = rewards;
fs.readdir("./commands/", (err, files) =>{

    if(err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() == "js");
    if(jsfile.length <= 0){
        console.log("Couldn't find commands.")
        return;
    }

    jsfile.forEach((f, i) =>{
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
        
    });

});

bot.on('ready', async () => {
    console.log(bot.user.username + " is now online!!");
    bot.channels.get("490356148961017866").fetchMessage("490362021506842634")
    bot.user.setActivity("in SkyLightServices!");
    setInterval(function(){
        bot.user.setActivity("in development");
        setTimeout(function(){
            bot.user.setActivity("in SkyLightServices!");
        }, 10000)
    }, 20000)
    setTimeout(function(){

    // Load all invites for all guilds and save them to the cache.
    bot.guilds.forEach(g => {
        g.fetchInvites().then(guildInvites => {
        invites[g.id] = guildInvites;
        });
    });
});
});
let selfRoles = [
    {role:"Updates",emoji:"🇺"},
    {role:"Polls",emoji:"🇵"},
    {role:"Events",emoji:"🇪"}
]
const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd'
};
bot.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;
    const { d: data } = event;
    const user = bot.users.get(data.user_id);
    const channel = bot.channels.get(data.channel_id);
    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const member = message.guild.member(user.id);
    if(channel.id == "489209245942808576"){
        selfRoles.forEach(element => {
            if(emojiKey == element.emoji){
                member.addRole(message.guild.roles.find(r => r.name.toLowerCase() == element.role.toLowerCase()));
                message.channel.send(member + ", You now have the ``" + element.role + "`` role!").then(msg => {msg.delete(5000)});
            }
        })
    }
})
bot.on("messageReactionAdd", (reaction) => {
    if(reaction.message.channel.name !== "apply") return;

    const member = reaction.users.last();
    const user = member.id;

    if(member.bot) return;
    if(reaction.emoji.name === "🇭"){
        reaction.remove(member);
        if (reaction.message.guild.channels.some(c => [`ticket-${user}`].includes(c.name))) {
            return reaction.message.reply(`You already have a ticket open`).then(async msg => msg.delete(3000))
        }
        reaction.message.guild.createChannel(`ticket-${user}`).then(async ch => {
            ch.setParent(`490358699651629069`)
            ch.overwritePermissions(reaction.message.guild.id, {
                VIEW_CHANNEL: false
            })
            ch.overwritePermissions(member.id, {
                READ_MESSAGES: true, SEND_MESSAGES: true
            })

            let ApplicationEmbed = new Discord.RichEmbed()
            .setDescription(`Welcome to your application ${member}.`)
            .setColor("RANDOM")
            ch.send(ApplicationEmbed)
        })
    }
})
const events2 = {
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
};
bot.on('raw', async event => {
    if (!events2.hasOwnProperty(event.t)) return;
    const { d: data } = event;
    const user = bot.users.get(data.user_id);
    const channel = bot.channels.get(data.channel_id);
    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const member = message.guild.member(user.id);
    if(channel.id == "489209245942808576"){
        selfRoles.forEach(element => {
            if(emojiKey == element.emoji){
                if(member.roles.has(message.guild.roles.find(r => r.name.toLowerCase() == element.role.toLowerCase()).id)){
                    member.removeRole(message.guild.roles.find(r => r.name.toLowerCase() == element.role.toLowerCase()));
                    message.channel.send(member + ", You no longer have the ``" + element.role + "`` role!").then(msg => {msg.delete(5000)});
                }
            }
        })
    }
});
bot.on('message', async (message) => {
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
    if(message.channel.id == "486278957856063509") {
        await message.react("✅");
        await message.react("❌");
    }
    let user = await User.findOrCreate(message.guild, message.author);

    if(message.channel.id == "490610018073182209"){
        message.delete();
        message.guild.createChannel(message.author.username).then(ch => {
            ch.setParent("490615226014760960");
            ch.overwritePermissions(message.author.id, {
                SEND_MESSAGES: true, READ_MESSAGE_HISTORY: true, READ_MESSAGES: true, VIEW_CHANNEL: true
            })
            ch.overwritePermissions(message.guild.id, {
                VIEW_CHANNEL: false
            })
            let embed = new Discord.RichEmbed()
            .setAuthor("New Ticket")
            .setFooter(bot.user.tag + " by ThisLightMan#6616")
            .setColor("#f4df42")
            .addField("User", message.member, true)
            .addField("User Credits", user.credits)
            .addField("Reason", message.content, true)
            .setTimestamp();
            ch.send(embed);

            let embed2 = new Discord.RichEmbed()
            .setDescription("Your ticket is ready in " + ch)
            .setColor("#f4df42");
            message.channel.send(embed2).then(msg => {msg.delete(5000)});
        })
    }
    //xp system
    let xpAdd = ~~((~~(Math.random()* 7) + 8)*user.xpmultiplier);
    let curXp = user.xp,
    curLvl = user.level
    nxtLvl = curLvl * 750;
    
    user.xp += xpAdd;
    if(nxtLvl <= curXp) {
        let lvlUp = new Discord.RichEmbed()
        .setTitle("Level Up!")
        .setColor("#ADD8E6")
        .addField("New Level", curLvl + 1)

        message.channel.send(lvlUp).then(msg => {msg.delete(5000)});   
        user.level = curLvl+1;         
    }
    // coin system

    let coinAmt = ~~(Math.random() * 10)
    let baseAmt = ~~(Math.random() * 10)

    if(coinAmt === baseAmt) {
        user.coins += coinAmt++;
        let coinEmbed = new Discord.RichEmbed()
            .setAuthor(`${message.author.username}`, message.member.displayAvatarURL)
            .setColor("RANDOM")
            .setTitle("Coins added Successfully") 
            .setDescription(`${coinAmt * user.coinmultiplier} Coins have been added to your balance`);
            message.channel.send(coinEmbed).then(msg => msg.delete(3000)); 
    }
    user.save();
    let prefix = "-";
    if(!message.content.startsWith(prefix)) return;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if(commandfile) commandfile.run(bot, message, args);
});




bot.on('guildMemberAdd', async (member) => {
    member.guild.fetchInvites().then(async guildInvites => {
        const ei = invites[member.guild.id];
        const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
        let channel = member.guild.channels.find("name", "join-leave");
        let embed = new Discord.RichEmbed()
        .setAuthor("New Member!")
        .setDescription("Welcome " + member + " to **" + member.guild.name + "**! Make sure to read " + member.guild.channels.find("name", "rules") + "! You were invited by " + invite.inviter + "!")
        .setColor("RANDOM")
        .setFooter(member.guild.memberCount + " members")
        .setTimestamp();
        channel.send(embed);
        member.guild.fetchInvites().then(async invites => {
            let invs = 0;
            invites.forEach(inv => {
                if(inv.inviter.id == invite.inviter.id) invs += inv.uses;
            })
            function isEven(n) {
                if(n == 0) return false;
                return n % 2 == 0;
            }
            if(isEven(invs)) {
                let user = await User.findOrCreate(member.guild, invite.inviter);
                user.credits += 2
                user.save();
                invite.inviter.send("You have invited 2 more people so you have recieved 2 credits! Your new balance is ``" + user.credits + "`` credits!");
            }
            rewards.forEach(async element => {
                if(invs == element.invites){
                    //they got a reward
                    if(element.type == "role"){
                        //the reward is a role
                        let role = member.guild.roles.find(r => r.name.toLowerCase() == element.role.toLowerCase());
                        if(!role) return;
                        member.guild.member(invite.inviter).addRole(role);
                        invite.inviter.send("You have achieved ``" + element.invites + "`` invites, so you have recieved the ``" + element.role + "`` role!");
                    }
                    if(element.type == "levels"){
                        //the reward is levels
                        let user = await User.findOrCreate(member.guild, invite.inviter);
                        user.level += element.levels;
                        user.save();
                        invite.inviter.send("You have achieved ``" + element.invites + "`` invites, so you have recieved ``" + element.levels + "`` levels!");
                    }
                }
            })
        })
    })
})

bot.on('guildMemberRemove', async (member) => {
    let channel = member.guild.channels.find("name", "join-leave");
    let embed = new Discord.RichEmbed()
    .setAuthor("Member Left")
    .setDescription(member + " (" + member.user.tag + ") has left the server!")
    .setColor("RANDOM")
    .setFooter(member.guild.memberCount + " members")
    .setTimestamp();
    channel.send(embed);
})
bot.login(process.env.TOKEN);
