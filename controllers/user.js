const dashboardKeys = require('../commands/models/dashboardKeysModel.js');

exports.checkExpiry = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        if (item.expired) {
            const guild = client.guilds.cache.get('927639271261737010');

            guild.members.fetch(item.discordId)
                .then(member => {
                    // member.roles.cache is a collection of roles the member has
                    member.roles.remove(member.roles.cache);
                })
                .catch(console.error);
        }
    });
}