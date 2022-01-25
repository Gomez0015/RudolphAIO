const giveMeAJoke = require('give-me-a-joke');

module.exports = {
    name: "guildMemberAdd",
    execute(member, bot) {
        //Log the newly joined member to console
        console.log("User " + member.user.tag + " has joined the server!");

        //Find a channel named welcome and send a Welcome message
        giveMeAJoke.getRandomDadJoke().then(joke => {
            bot.channels.cache.get('927639271597305987').send("Welcome To the North Pole! " + member.toString() + " \nheres a joke for ya " + joke);
        });
    }
};