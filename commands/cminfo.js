const candyMachineScraper = require('candymachinescraper');
const { MessageEmbed } = require('discord.js');
const apiKeyId = '3VH9zdP8Qsou9YF';
const apiSecretKey = 'UAy0ltehq8SA3D3';

exports.run = async(bot, message, args) => {
    let url = args[0];
    await candyMachineScraper.getCandyId('./node_modules', url, function(data) {
        if (data.state == 'error') {
            let responseData = data.data;
            message.reply(data.state + ": " + responseData);
        } else {
            let candyId = data.data;
            await candyMachineScraper.getMetaData(apiKeyId, apiSecretKey, candyId, function(data) {
                if (data.state == 'error') { message.reply(data.state + ": " + data.data); return; }
                const candyEmbed = new MessageEmbed()
                    .setColor('#221f20')
                    .setTitle('Scraped Candy Machine Info')
                    .setURL(url)
                    .addFields({ name: 'ID', value: candyId })
                    .addField('Inline field title', 'Some value here', true)
                    .setTimestamp()
                    .setAuthor({ name: 'Raxo#0468', iconURL: 'https://avatars.githubusercontent.com/u/56361339?v=4', url: 'https://github.com/Gomez0015' })

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