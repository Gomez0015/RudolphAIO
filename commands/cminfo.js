const candyMachineScraper = require('candymachinescraper');
const { MessageEmbed } = require('discord.js');

exports.run = async(bot, message, args) => {
    let url = args[0];
    await candyMachineScraper.getScript('./node_modules', url, function(data) {
        let responseData = 'Hello World!';
        if (data.state == 'error') {
            responseData = data.message;
            message.reply(data.state + ": " + responseData);
        } else {
            responseData = data.data;
            const candyEmbed = new MessageEmbed()
                .setColor('#221f20')
                .setTitle('Scraped Candy Machine Info')
                .setURL(url)
                .addFields({ name: 'ID', value: responseData })
                .addField('Inline field title', 'Some value here', true)
                .setTimestamp()
                .setAuthor({ name: 'Raxo#0468', iconURL: 'https://avatars.githubusercontent.com/u/56361339?v=4', url: 'https://github.com/Gomez0015' })

            message.reply({ embeds: [candyEmbed] });
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