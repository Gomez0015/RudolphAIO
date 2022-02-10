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
                const candyEmbed = new MessageEmbed()
                    .setColor('#221f20')
                    .setTitle('Scraped Candy Machine Info')
                    .setURL(url)
                    .addFields({ name: 'ID', value: candyId }, { name: 'Live Date', value: '<t:' + data.data.go_live_date.toString() + '>' }, { name: 'Supply', value: data.data.items_available.toString() }, { name: 'Minted', value: data.data.items_redeemed.toString() + '/' + data.data.items_available.toString() }, { name: 'Left', value: (data.data.items_available - data.data.items_redeemed).toString() }, { name: 'Price', value: (data.data.price / 1000000000).toString() + ' SOL' }, { name: 'Symbol', value: data.data.symbol })
                    .setTimestamp()
                    .setThumbnail(bot.user.displayAvatarURL())
                    .setAuthor({ name: 'Raxo#0468', iconURL: 'https://avatars.githubusercontent.com/u/56361339?v=4', url: 'https://github.com/Gomez0015' })
                    .setFooter({ text: bot.user.name, iconURL: bot.user.displayAvatarURL() });

                message.reply({ embeds: [candyEmbed] });
            });
        }

        // {
        //   state: 'success',
        //   data: '2QcWbuQTyfEDdHHhpgfoXfptkFipE5J1SqQiZxvZERuR'
        // }
    });
}


// 0|DiscordBot  | {
// 0|DiscordBot  |   authority: 'BE7n2ZCDfFvCvNxGkjPssbBtzJ9sHd1Q2AJKtDfi6H4B',
// 0|DiscordBot  |   candy_machine_id: '4wi6DJccrkX8PQXN4z9dbc8LgLC3CpEsY2hsT9Z8TrXg',
// 0|DiscordBot  |   config_address: '4wi6DJccrkX8PQXN4z9dbc8LgLC3CpEsY2hsT9Z8TrXg',
// 0|DiscordBot  |   creators: [
// 0|DiscordBot  |     'BE7n2ZCDfFvCvNxGkjPssbBtzJ9sHd1Q2AJKtDfi6H4B',
// 0|DiscordBot  |     50,
// 0|DiscordBot  |     'Hr1ccUaft5Y3hTNaC8C2E9m5QbR9waSAqncMNJmSisK1',
// 0|DiscordBot  |     50
// 0|DiscordBot  |   ],
// 0|DiscordBot  |   end_settings: { end_on_x_date: null, end_when_x_sold: null },
// 0|DiscordBot  |   gatekeeper: { expire_on_use: null, gatekeeper_network: null },
// 0|DiscordBot  |   go_live_date: 1644390000,
// 0|DiscordBot  |   hidden_settings: null,
// 0|DiscordBot  |   is_mutable: true,
// 0|DiscordBot  |   items_available: 500,
// 0|DiscordBot  |   items_redeemed: 189,
// 0|DiscordBot  |   key: '4wi6DJccrkX8PQXN4z9dbc8LgLC3CpEsY2hsT9Z8TrXg',
// 0|DiscordBot  |   max_supply: 0,
// 0|DiscordBot  |   partial_info: false,
// 0|DiscordBot  |   price: 2250000000,
// 0|DiscordBot  |   retain_authority: true,
// 0|DiscordBot  |   seller_fee_basis_points: 800,
// 0|DiscordBot  |   share: [],
// 0|DiscordBot  |   symbol: 'GATE',
// 0|DiscordBot  |   token_mint: null,
// 0|DiscordBot  |   uuid: '4wi6DJ',
// 0|DiscordBot  |   wallet: 'BE7n2ZCDfFvCvNxGkjPssbBtzJ9sHd1Q2AJKtDfi6H4B',
// 0|DiscordBot  |   whitelist: {
// 0|DiscordBot  |     discounted_price: null,
// 0|DiscordBot  |     mint: '7aEkSoizm3CKqVGe4nK1ovVTyapJ4cdJf5hQgr66Xrcv',
// 0|DiscordBot  |     mode: { burnEveryTime: {} },
// 0|DiscordBot  |     presale: false
// 0|DiscordBot  |   }
// 0|DiscordBot  | }

exports.info = {
    name: "cminfo",
    description: "Get Candy Machine Info"
}