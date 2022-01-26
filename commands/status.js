const isUp = require('is-up');

exports.run = async(bot, message, args) => {
    var host = 'https://beta.rudolphaio.com/';
    await isUp(host).then(function(isUp) {
        var msg = isUp ? 'host \`' + host + '\` is alive' : 'host \`' + host + '\` is dead';
        message.channel.send("Status: " + msg);
    });
}

exports.info = {
    name: "status",
    description: "Check RudolphAIO Server Status"
}