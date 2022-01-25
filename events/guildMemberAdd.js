const giveMeAJoke = require('give-me-a-joke');

module.exports = {
    name: "guildMemberAdd",
    execute(member, bot) {
        //Log the newly joined member to console
        console.log("User " + member.user.tag + " has joined the server!");

        //Find a channel named welcome and send a Welcome message
        bot.channels.cache.get('927639271597305987').send("Welcome To the North Pole! " + member.toString() + " \n heres a joke for ya " + giveMeAJoke.getRandomDadJoke());
    }
};