const dashboardKeys = require('../commands/models/dashboardKeysModel.js');

exports.checkExpiry = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        if (item.expired) {
            const member = reaction.message.guild.members.cache.get(item.discordId);
            member.roles.remove(member.roles.cache);
        }
    });
}