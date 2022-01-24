const { MessageEmbed } = require('discord.js');

exports.run = async(bot, message, args) => {
    // Variables
    var muteRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes("muted"));
    var muteChannel = message.guild.channels.cache.find(channel => channel.name.includes("staff-logs"));
    var muteUser = message.mentions.members.first();
    var muteReason = args[1];

    // Conditions for muting
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send("You don't have the permissions"); //the member has higher perms
    if (!muteUser) return message.channel.send("You have to mention a valid member");
    if (muteUser.roles.cache.find(r => r.name === "muted")) return message.channel.send("User already muted :clown:");
    if (!muteChannel) return message.channel.send("There's no channel called staff-logs");
    if (!muteRole) return message.channel.send("There's no role called muted");
    if (!message.guild.members.cache.get(bot.user.id).permissions.has("MANAGE_ROLES")) return message.channel.send("I Don't have permissions");
    if (!muteReason) muteReason = "No reason given";

    // Embed for details of mute
    var muteEmbed = new MessageEmbed()
        .setTitle("Mute")
        .addField("Muted user", muteUser.toString())
        .addField("Reason", muteReason)
        .setFooter(`Muted by ${message.author.tag}`)
        .setTimestamp();

    //Mute
    muteUser.roles.add(muteRole);
    message.channel.send(`${muteUser} has been muted`);
    muteChannel.send({ embeds: [muteEmbed] });
}

exports.info = {
    name: "mute",
    description: "Mute Someone **(Admin Only)**"
}