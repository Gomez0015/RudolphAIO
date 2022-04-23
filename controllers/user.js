const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const levelFarms = require('../commands/models/levelFarmModel.js');

function getNumberOfDays(start, end) {
    const date1 = new Date(start);
    const date2 = new Date(end);

    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneDay);

    return diffInDays;
}

exports.checkExpiry = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        if (item.expired) {
            const guild = bot.guilds.cache.get('927639271261737010');

            guild.members.fetch(item.discordId)
                .then(member => {
                    // member.roles.cache is a collection of roles the member has
                    member.roles.remove(member.roles.cache);
                })
                .catch(console.error);
        } else if (getNumberOfDays(item.start_date, new Date()) >= 31 && item.expired == false) {
            await dashboardKeys.updateOne({ key: item.key }, { expired: true, monitors: [] });
            await levelFarms.deleteMany({ discordId: item.discordId });
        }
    });
}