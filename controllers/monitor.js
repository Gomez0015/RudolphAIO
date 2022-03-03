const dashboardKeys = require('../models/dashboardKeysModel.js');
const axios = require('axios');

exports.checkMonitors = async function(bot) {
    const dashboardKeys = await dashboardKeys.find({});

    await dashboardKeys.forEach(async function(item) {
        item.monitors.collections.forEach(async function(collection) {
            const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection.data}/stats`);
            console.log(response);
            if ((response.floorPrice / 1000000000) <= 2) {
                let user = client.users.cache.fetch(dashboardKeys.discordId);
                user.send(`😱 ${collection.data} floor price is down to ${response.floorPrice} SOL !!`);
            }
        });
    });
}