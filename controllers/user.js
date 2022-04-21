const dashboardKeys = require('../commands/models/dashboardKeysModel.js');

exports.checkExpiry = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        if (item.expired) {
            const member = bot.users.cache.get(item.discordId);
            console.log(item.discordId, member);
            member.roles.remove(member.roles.cache);
        }
    });
}