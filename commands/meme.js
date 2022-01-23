const memes = require("random-memes");

exports.run = async(bot, message, args) => {
    memes.random().then(meme => {
        message.channel.send(meme.image);
    });
}

exports.info = {
    name: "meme",
    description: "Random Meme"
}