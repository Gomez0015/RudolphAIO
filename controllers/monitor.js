const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const axios = require('axios');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

exports.checkMonitors = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
            await item.monitors.collections.forEach(async function(collection) {
                try {
                    const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection.data}/stats`)

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setLabel('Show Collection')
                            .setStyle('LINK')
                            .setURL(`https://magiceden.io/marketplace/${collection.data}`)
                        );

                    if ((response.data.floorPrice / 1000000000) <= parseFloat(collection.floorLow)) {
                        if (collection.lastSent != 'floorLow') {
                            let user = await bot.users.fetch(item.discordId);
                            let alert = `😱 ${collection.data} floor price is 📉 to **${response.data.floorPrice / 1000000000}** SOL !!`;

                            await user.send({ content: alert, components: [row] });
                            collection.lastSent = 'floorLow';
                            await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                        }
                    } else if ((response.data.floorPrice / 1000000000) >= parseFloat(collection.floorHigh)) {
                        if (collection.lastSent != 'floorHigh') {
                            let user = await bot.users.fetch(item.discordId);
                            let alert = `🚀 ${collection.data} floor price is 📈 to **${response.data.floorPrice / 1000000000}** SOL !!`

                            await user.send({ content: alert, components: [row] });
                            collection.lastSent = 'floorHigh';
                            await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                        }
                    }
                } catch (error) {
                    console.log(err.message);
                }
            });

            await item.monitors.wallets.forEach(async function(wallet) {
                    try {
                        const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/wallets/${wallet.data}/activities?offset=0&limit=1`)
                        const tokenResponse = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${response.data[0].tokenMint}`)

                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel('Show Item')
                                .setStyle('LINK')
                                .setURL(`https://magiceden.io/item-details/${response.data[0].tokenMint}`)
                            );

                        if (wallet.lastSent != response.data[0].signature) {
                            let user = await bot.users.fetch(item.discordId);
                            let alert = 'Impossible!'

                            switch (response.data[0].type) {
                                case 'list':
                                    alert = `🏳️ Listed **${tokenResponse.data.name}** on ${response.data[0].collection} collection for **${response.data[0].price}** SOL!`
                                    break;
                                case 'delist':
                                    alert = `🚫 Canceled Listing of **${tokenResponse.data.name}** on ${response.data[0].collection} collection`
                                    break;
                                case 'buyNow':
                                    if (response.data[0].seller == wallet.data) {
                                        alert = `💰 Sold **${tokenResponse.data.name}**, for **${response.data[0].price}** SOL!`
                                    } else {
                                        alert = `🎉 Bought **${tokenResponse.data.name}**, for **${response.data[0].price}** SOL!`
                                    }
                                    break;
                                case 'bid':
                                    if (response.data[0].buyer == wallet.data) {
                                        alert = `🖊️ Placed new bid on **${tokenResponse.data.name}**, @ **${response.data[0].price}** SOL!`
                                    } else {
                                        alert = `🤑 Recieved new bid on **${tokenResponse.data.name}**, @ **${response.data[0].price}**  SOL!`
                                    }
                                    break;
                                case 'cancelBid':
                                    if (response.data[0].buyer == wallet.data) {
                                        alert = `😢 Canceled bid on **${tokenResponse.data.name}**, @ **${response.data[0].price}** SOL!`
                                    }
                                    break;
                                default:
                                    console.log('bruh');
                            }

                            await user.send({ content: alert, components: [row] });
                            wallet.lastSent = response.data[0].signature;
                            await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                        }
                    } catch (error) {
                        console.log(err.message);
                    }
                }

            });
    });
}