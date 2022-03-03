const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const axios = require('axios');

exports.checkMonitors = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        item.monitors.collections.forEach(async function(collection) {
            const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection.data}/stats`);
            console.log(response.data);
            if ((response.data.floorPrice / 1000000000) <= 2) {
                let user = bot.users.fetch(item.discordId);
                console.log(user);
                user.send(`😱 ${collection.data} floor price is down to ${response.data.floorPrice} SOL !!`);
            }
        });
    });
}