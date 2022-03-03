const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const axios = require('axios');

exports.checkMonitors = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        await item.monitors.collections.forEach(async function(collection) {
            const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection.data}/stats`);

            if ((response.data.floorPrice / 1000000000) <= parseFloat(collection.floorLow)) {
                if (collection.lastSent != 'floorLow') {
                    let user = await bot.users.fetch(item.discordId);
                    await user.send(`😱 ${collection.data} floor price is 📉 to ${response.data.floorPrice / 1000000000} SOL !!`);
                    collection.lastSent = 'floorLow';
                    await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                }
            } else if ((response.data.floorPrice / 1000000000) >= parseFloat(collection.floorHigh)) {
                if (collection.lastSent != 'floorHigh') {
                    let user = await bot.users.fetch(item.discordId);
                    await user.send(`🚀 ${collection.data} floor price is 📈 to ${response.data.floorPrice / 1000000000} SOL !!`);
                    collection.lastSent = 'floorHigh';
                    await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                }
            }
        });
    });
}