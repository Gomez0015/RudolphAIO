const candyMachineScraper = require('candymachinescraper');

exports.run = async(bot, message, args) => {
    let url = args[0];
    console.log(url);
    await candyMachineScraper.getScript('./node_modules', url, function(data) {
        message.reply(data.state + ": " + data.message);
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