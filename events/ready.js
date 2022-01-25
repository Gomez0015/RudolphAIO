const http = require('http');
const cron = require('node-cron');
const dashboardKeys = require('../commands/models/dashboardKeysModel.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(bot) {
        //Log Bot's username and the amount of servers its in to console
        console.log(`${bot.user.username} is online and ready to fly!`);

        //Set the Presence of the bot user
        bot.user.setPresence({ activities: [{ name: 'Delivering Whitelists around the globe!' }] });

        var host = 'beta.rudolphaio.com';
        var statusChannel = bot.channels.cache.get("935478854049484810");
        let lastState = 1;

        cron.schedule('*/30 * * * *', () => {
            http.get('http://example.com/category', function(res) {
                // If you get here, you have a response.
                // If you want, you can check the status code here to verify that it's `200` or some other `2xx`.
                var msg = res.statusCode === 200 ? 'host \`' + host + '\` is alive' : 'host \`' + host + '\` is dead';
                var roleId = "935478022868451329";
                if (lastState == 0 && res.statusCode === 200) {
                    lastState = 1;
                    statusChannel.send("<@&" + roleId + "> Server is back up!");
                } else if (lastState == 1 && res.statusCode != 200) {
                    lastState = 0;
                    statusChannel.send("<@&" + roleId + "> Server is down!");
                }

            }).on('error', function(e) {
                console.log(e);
            });
        });

        bot.channels.cache.get('935609003227111445').messages.fetch('935609487107162182');
        bot.channels.cache.get('927639271345627214').messages.fetch('935661832360824913');

        bot.on('messageReactionAdd', async(reaction, user) => {
            if (user.bot) return;
            const member = reaction.message.guild.members.cache.get(user.id);
            if (reaction.message.id === '935609487107162182') {
                if (reaction.emoji.name === '🏳️') {
                    if (!member.roles.cache.find(r => r.name === "server-status")) {
                        await member.roles.add('935478022868451329');
                    }
                } else if (reaction.emoji.name === '🏴') {
                    if (!member.roles.cache.find(r => r.name === "change-log")) {
                        await member.roles.add('935478118343393290');
                    }
                }
            } else if (reaction.message.id === '935661832360824913') {
                if (reaction.emoji.name === '✅') {
                    if (!member.roles.cache.find(r => r.name === "Member")) {
                        const userHasKey = await dashboardKeys.find({ discordId: user.id });
                        if (userHasKey.length > 0) {
                            await member.roles.add('927639271312076858');
                        } else {
                            reaction.users.remove(user);
                            user.send("You don't have a dashboard key!");
                        }
                    }
                }
            }
        });

        bot.on('messageReactionRemove', async(reaction, user) => {
            if (user.bot) return;
            const member = reaction.message.guild.members.cache.get(user.id);
            if (reaction.message.id === '935609487107162182') {
                if (reaction.emoji.name === '🏳️') {
                    if (member.roles.cache.find(r => r.name === "server-status")) {
                        await member.roles.remove('935478022868451329');
                    }
                } else if (reaction.emoji.name === '🏴') {
                    if (member.roles.cache.find(r => r.name === "change-log")) {
                        await member.roles.remove('935478118343393290');
                    }
                }
            } else if (reaction.message.id === '935661832360824913') {
                if (reaction.emoji.name === '✅') {
                    if (member.roles.cache.find(r => r.name === "Member")) {
                        await member.roles.remove('927639271312076858');
                    }
                }
            }
        })
    }
}