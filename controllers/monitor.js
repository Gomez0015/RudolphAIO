const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

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

        await item.monitors.wallets.forEach(async function(wallet) {
            const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/wallets/${wallet.data}/activities?offset=0&limit=1`);

            if (wallet.lastSent != response[0]) {
                let user = await bot.users.fetch(item.discordId);
                const walletEmbed = new MessageEmbed()
                    .setTitle('New Wallet Activity')
                    .setURL(`https://api-mainnet.magiceden.dev/v2/wallets/${wallet.data}/activities?offset=0&limit=1`)
                    .addFields({
                        name: 'Type',
                        value: response[0].type
                    }, {
                        name: 'Collection',
                        value: response[0].collection
                    }, {
                        name: 'Price',
                        value: response[0].price,
                    }, )
                    .setTimestamp()
                    .setFooter({ text: 'RudolphAIO Monitors', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

                await user.send({ embeds: [walletEmbed] });
                wallet.lastSent = response[0];
                await dashboardKeys.updateOne({ discordId: item.discordId }, item);
            }

        });
    });
}