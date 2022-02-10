const candyMachineScraper = require('candymachinescraper');

exports.run = async(bot, message, args) => {
    let url = args[0];
    await candyMachineScraper.getScript('./node_modules', url, function(data) {
        let responseData = 'Hello World!';
        if (data.state == 'error')
            responseData = data.message;
        else
            responseData = data.data;

        message.reply(data.state + ": " + reponseData);
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