const { Client, Intents, Collection } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const ReactionRole = require("discordjs-reaction-role").default;
require('dotenv').config();
const prefix = process.env.DISCORD_BOT_PREFIX;
const fs = require("fs");
bot.commands = new Collection();

const rr = new ReactionRole(client, [
    { messageId: "935609487107162182", reaction: "🏳️", roleId: "935478022868451329" }, // Custom emoji by ID
    { messageId: "935609487107162182", reaction: "🏴", roleId: "935478118343393290" }, // Custom emoji by emoji name
]);

const commandFiles = fs.readdirSync('./commands/').filter(f => f.endsWith('.js'))
for (const file of commandFiles) {
    const props = require(`./commands/${file}`)
    console.log(`${file} loaded`)
    bot.commands.set(props.info.name, props)
}

// Load Event files from events folder
const eventFiles = fs.readdirSync('./events/').filter(f => f.endsWith('.js'))

for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot))
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot))
    }
}

//Command Manager
bot.on("messageCreate", async message => {
    //Check if author is a bot or the message was sent in dms and return
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    //get prefix from config and prepare message so it can be read as a command
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    //Check for prefix
    if (!cmd.startsWith(prefix)) return;

    //Get the command from the commands collection and then if the command is found run the command file
    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);

});

bot.login(process.env.DISCORD_BOT_TOKEN);