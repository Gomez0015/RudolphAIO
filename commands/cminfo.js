const candyMachineScraper = require('candymachinescraper');
const { MessageEmbed } = require('discord.js');
const apiKeyId = '3VH9zdP8Qsou9YF';
const apiSecretKey = 'UAy0ltehq8SA3D3';

exports.run = async(bot, message, args) => {
    let url = args[0];
    await candyMachineScraper.getCandyId('./node_modules', url, async function(data) {
        if (data.state == 'error') {
            let responseData = data.data;
            message.reply(data.state + ": " + responseData);
        } else {
            let candyId = data.data;
            await candyMachineScraper.getMetaData(apiKeyId, apiSecretKey, candyId, function(data) {
                if (data.state == 'error') { message.reply(data.state + ": " + data.data); return; }

                let civic = false;
                if (data.data.gatekeeper) {
                    if (data.data.gatekeeper.gatekeeper_network != null) {
                        civic = true;
                    }
                }

                const candyEmbed = new MessageEmbed()
                    .setColor('#221f20')
                    .setTitle('Scraped Candy Machine Info')
                    .setURL(url)
                    .addFields({ name: 'ID', value: candyId }, { name: 'Live Date', value: '<t:' + data.data.go_live_date.toString() + '>' }, { name: 'Supply', value: data.data.items_available.toString() }, { name: 'Minted', value: data.data.items_redeemed.toString() + '/' + data.data.items_available.toString() }, { name: 'Left', value: (data.data.items_available - data.data.items_redeemed).toString() }, { name: 'Price', value: (data.data.price / 1000000000).toString() + ' SOL' }, { name: 'Symbol', value: data.data.symbol }, { name: 'Civic', value: civic.toString() })
                    .setTimestamp()
                    .setThumbnail(bot.user.displayAvatarURL())
                    .setAuthor({ name: 'Raxo#0468', iconURL: 'https://avatars.githubusercontent.com/u/56361339?v=4', url: 'https://github.com/Gomez0015' })
                    .setFooter({ text: bot.user.tag, iconURL: bot.user.displayAvatarURL() });

                message.reply({ embeds: [candyEmbed] });
            });
        }

        // {
        //   state: 'success',
        //   data: '2QcWbuQTyfEDdHHhpgfoXfptkFipE5J1SqQiZxvZERuR'
        // }
    });
}


exports.info = {
    name: "cminfo",
    description: "Get Candy Machine Info"
}