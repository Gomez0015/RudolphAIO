const ping = require('ping');

exports.run = async(bot, message, args) => {
    var host = 'beta.rudolphaio.com';
    ping.sys.probe(host, function(isAlive) {
        var msg = isAlive ? 'host \`' + host + '\` is alive' : 'host ' + host + ' is dead';
        message.channel.send("Status: " + msg);
    });
}

exports.info = {
    name: "status",
    description: "Check RudolphAIO Server Status"
}