const { MessageEmbed } = require('discord.js');

exports.run = async(bot, message, args) => {
    // Variables
    var muteRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes("muted"));
    var muteChannel = message.guild.channels.cache.find(channel => channel.name.includes("staff-logs"));
    var muteUser = message.mentions.members.first();

    // Conditions for muting
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send("You don't have the permissions"); //the member has higher perms
    if (!muteUser) return message.channel.send("You have to mention a valid member");
    if (!(muteUser.roles.cache.find(r => r.name === "muted"))) return message.channel.send("User is not muted :clown:");
    if (!muteChannel) return message.channel.send("There's no channel called staff-logs");
    if (!muteRole) return message.channel.send("There's no role called muted");
    if (!message.guild.members.cache.get(bot.user.id).permissions.has("MANAGE_ROLES")) return message.channel.send("I Don't have permissions");

    // Embed for details of mute
    var unMuteEmbed = new MessageEmbed()
        .setTitle("unMute")
        .addField("unMuted user", muteUser.toString())
        .setFooter(`unMuted by ${message.author.tag}`)
        .setTimestamp();

    //unMute
    muteUser.roles.remove(muteRole);
    message.channel.send(`${muteUser} has been unmuted`);
    muteChannel.send({ embeds: [unMuteEmbed] });
}

exports.info = {
    name: "unmute",
    description: "unMute Someone **(Admin Only)**"
}