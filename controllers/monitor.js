const dashboardKeys = require('../commands/models/dashboardKeysModel.js');
const axios = require('axios');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

exports.checkMonitors = async function(bot) {
    const dashboardKeysData = await dashboardKeys.find({});

    await dashboardKeysData.forEach(async function(item) {
        if (item.monitors.length > 0) {
            await item.monitors.collections.forEach(async function(collection) {
                try {
                    let response;
                    let url;
                    let row;

                    switch (collection.siteName) {
                        case 'ME':
                            response = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection.data}/stats`);
                            url = `https://magiceden.io/marketplace/${collection.data}`;


                            row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                    .setLabel('Show Collection')
                                    .setStyle('LINK')
                                    .setURL(url)
                                );

                            if ((response.data.floorPrice / 1000000000) <= parseFloat(collection.floorLow)) {
                                if (collection.lastSent != 'floorLow') {
                                    let user = await bot.users.fetch(item.discordId);
                                    console.log(response.data.floorPrice, '!!!!!!!!!')
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

                            break;
                        case 'SA':
                            response = await axios.get(`https://api.solanart.io/get_floor_price?collection=${collection.data}`);
                            url = `https://solanart.io/collections/${collection.data}`;


                            row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                    .setLabel('Show Collection')
                                    .setStyle('LINK')
                                    .setURL(url)
                                );

                            if ((response.data.floorPrice) <= parseFloat(collection.floorLow)) {
                                if (collection.lastSent != 'floorLow') {
                                    let user = await bot.users.fetch(item.discordId);
                                    let alert = `😱 ${collection.data} floor price is 📉 to **${response.data.floorPrice}** SOL !!`;

                                    await user.send({ content: alert, components: [row] });
                                    collection.lastSent = 'floorLow';
                                    await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                                }
                            } else if ((response.data.floorPrice) >= parseFloat(collection.floorHigh)) {
                                if (collection.lastSent != 'floorHigh') {
                                    let user = await bot.users.fetch(item.discordId);
                                    let alert = `🚀 ${collection.data} floor price is 📈 to **${response.data.floorPrice}** SOL !!`

                                    await user.send({ content: alert, components: [row] });
                                    collection.lastSent = 'floorHigh';
                                    await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                                }
                            }
                            break;
                        case 'OS':
                            response = await axios.get(`https://api.opensea.io/api/v1/collection/${collection.data}/stats`, {
                                headers: {
                                    'X-API-KEY': process.env.OPEN_SEA_KEY
                                }
                            });
                            url = `https://opensea.io/collection/${collection.data}`;
                            response.data.floorPrice = response.data.stats.floor_price;

                            row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                    .setLabel('Show Collection')
                                    .setStyle('LINK')
                                    .setURL(url)
                                );

                            if ((response.data.floorPrice) <= parseFloat(collection.floorLow)) {
                                if (collection.lastSent != 'floorLow') {
                                    let user = await bot.users.fetch(item.discordId);
                                    let alert = `😱 ${collection.data} floor price is 📉 to **${response.data.floorPrice}** !!`;

                                    await user.send({ content: alert, components: [row] });
                                    collection.lastSent = 'floorLow';
                                    await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                                }
                            } else if ((response.data.floorPrice) >= parseFloat(collection.floorHigh)) {
                                if (collection.lastSent != 'floorHigh') {
                                    let user = await bot.users.fetch(item.discordId);
                                    let alert = `🚀 ${collection.data} floor price is 📈 to **${response.data.floorPrice}** !!`

                                    await user.send({ content: alert, components: [row] });
                                    collection.lastSent = 'floorHigh';
                                    await dashboardKeys.updateOne({ discordId: item.discordId }, item);
                                }
                            }

                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.log(error.message, item.discordId);
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
                    console.log(error.message, item.discordId);
                }

            });
        }
    });
}