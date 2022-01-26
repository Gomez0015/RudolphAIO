const http = require("http");

exports.run = async(bot, message, args) => {

    var host = 'beta.rudolphaio.com';

    http.get({ host: host }, function(res) {
        if (res.statusCode == 200 || res.statusCode == 301)
            var msg = 'host \`' + host + '\` is alive';
        else
            var msg = 'host \`' + host + '\` is dead';

        message.channel.send("Status: " + msg);
    });
}

exports.info = {
    name: "status",
    description: "Check RudolphAIO Server Status"
}