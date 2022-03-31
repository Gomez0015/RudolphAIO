const http = require('http');
const cron = require('node-cron');
const Twitter = require('twit');
const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const monitor = require('../controllers/monitor.js')

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
        let roleId = '935478022868451329';

        cron.schedule('*/30 * * * *', () => {

            http.get({ host: host }, function(res) {
                console.log(res.statusCode);
                if (lastState == 0 && res.statusCode == 200 || lastState == 0 && res.statusCode == 301) {
                    lastState = 1;
                    statusChannel.send("<@&" + roleId + "> Server is back up!");
                } else if (lastState == 1 && res.statusCode == 404 || lastState == 1 && res.statusCode == 500) {
                    lastState = 0;
                    statusChannel.send("<@&" + roleId + "> Server is down!");
                }
            });
        });

        cron.schedule('* * * * *', () => {
            monitor.checkMonitors(bot);
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
                } else if (reaction.emoji.name === 'sol') {
                    if (!member.roles.cache.find(r => r.name === "SOL")) {
                        await member.roles.add('936320374294065233');
                    }
                } else if (reaction.emoji.name === 'eth') {
                    if (!member.roles.cache.find(r => r.name === "ETH")) {
                        await member.roles.add('936320420200722493');
                    }
                } else if (reaction.emoji.name === 'veve') {
                    if (!member.roles.cache.find(r => r.name === "VEVE")) {
                        await member.roles.add('959089540994310186');
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
                            try {
                                user.send("You don't have a dashboard key!");
                            } catch (e) {
                                console.log(e.message);
                            }
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
                } else if (reaction.emoji.name === 'sol') {
                    if (member.roles.cache.find(r => r.name === "SOL")) {
                        await member.roles.remove('936320374294065233');
                    }
                } else if (reaction.emoji.name === 'eth') {
                    if (member.roles.cache.find(r => r.name === "ETH")) {
                        await member.roles.remove('936320420200722493');
                    }
                } else if (reaction.emoji.name === 'veve') {
                    if (member.roles.cache.find(r => r.name === "VEVE")) {
                        await member.roles.remove('959089540994310186');
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

        //Get Twitter Feed

        // Configure Twitter API

        const twitterConf = {
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        }

        // Create a twitter client.
        const twitterClient = new Twitter(twitterConf);

        // Specify destination channel ID below
        const dest = '927639271597305993';

        // Create a stream to follow tweets
        const stream = twitterClient.stream('statuses/filter', {
            follow: '1481399997560233986', // @rudolphaio, specify whichever Twitter ID you want to follow
        });

        // SOURCE:
        // https://github.com/ttezel/twit/issues/286#issuecomment-236315960
        function isReply(tweet) {
            if (tweet.retweeted_status ||
                tweet.in_reply_to_status_id ||
                tweet.in_reply_to_status_id_str ||
                tweet.in_reply_to_user_id ||
                tweet.in_reply_to_user_id_str ||
                tweet.in_reply_to_screen_name) return true;
            return false;
        }

        stream.on('tweet', tweet => {
            if (isReply(tweet) == false) {
                const twitterMessage = `${tweet.user.name} (@${tweet.user.screen_name}) tweeted this: https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
                bot.channels.cache.get(dest).send(twitterMessage);
                return false;
            }
        });
    }
}