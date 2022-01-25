const http = require('http');
const cron = require('node-cron');

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

        var messageForRoles = bot.messages.cache.get("935609487107162182");

        const filter = (reaction, user) => {
            console.log(reaction.message);
            return reaction.emoji.name === '🏳️';
        };

        const collector = messageForRoles.createReactionCollector({ filter });

        collector.on('collect', (reaction, user) => {
            const role = await bot.roles.cache.fetch('935478022868451329');
            reaction.author.roles.add(role);
        });
    }
}