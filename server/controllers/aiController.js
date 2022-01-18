var axios = require('axios');
const Discord = require('discord.js-selfbot');
require("./customLibraries/ExtendedMessage");
const levelFarms = require('../models/levelFarmModel.js');
require('dotenv').config();
var fs = require('fs');
const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
let chatLogs = ''

fs.readFile('./prompt.txt', 'utf8', function(err, data) {
    chatLogs = data;
});

exports.getAnswer = async function(res, req) {
    chatLogs += `Human: ${req.body.text}\n`;
    let tempChatLogs = chatLogs.replace('{botName}', req.body.botData.botName.split('#')[0]).replace('{collectionName}', req.body.botData.collectionName).replace('{mintDate}', req.body.botData.mintDate);
    await openai.complete({
            engine: 'babbage',
            prompt: tempChatLogs,
            maxTokens: 25,
            temperature: 0.9,
            topP: 1,
            presencePenalty: 0.6,
            frequencyPenalty: 0,
            stop: ["\n", " Human:", " AI:"]
        }).then(function(response) {
            chatLogs += `${response.data.choices[0].text.replace(req.body.botData.botName.split('#')[0], '{botName}').replace(req.body.botData.collectionName, '{collectionName}').replace(req.body.botData.mintDate, '{mintDate}')}\n`;
            answer = response.data.choices[0].text.substr(4);
            res.send(answer);
        })
        .catch(err => {
            console.log(err, 1);
            res.send('error');
        });
}

exports.getFarmingData = async function(res, req) {
    const data = await levelFarms.find({ discordId: req.body.userToken });
    if (data) {
        res.send(data);
    } else {
        res.send([]);
    }
}

exports.stopFarming = async function(res, req) {
    getAllFarms();
    const data = await levelFarms.findOne({ discordId: req.body.userToken, running: true });
    if (data) {
        await levelFarms.updateOne(data, { running: false });
        res.send({ state: 'success', message: 'Successfully stopped bot' });
    } else {
        res.send({ state: 'error', message: 'You have no bots currently farming' });
    }
}

exports.updateBotSettings = async function(res, req) {
    const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });
    if (data) {
        await levelFarms.updateOne(data, { messageDelay: req.body.botData.messageDelay, channelId: req.body.botData.channelId, collectionName: req.body.botData.collectionName, mintDate: req.body.botData.mintDate });
        res.send({ state: 'success', message: 'Successfully updated settings' });
    } else {
        res.send({ state: 'error', message: 'Couldnt seem to find the bot' });
    }
}

exports.deleteBot = async function(res, req) {
    const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });
    if (data) {
        await levelFarms.deleteOne(data);
        res.send({ state: 'success', message: 'Successfully deleted bot' });
    } else {
        res.send({ state: 'error', message: 'Couldnt seem to find the bot' });
    }
}

allFarmData = [];

async function getAllFarms() {
    allFarmData = await levelFarms.find({});
}

exports.startFarming = async function(res, req) {
    let checkIfFarming = await levelFarms.findOne({ discordId: req.body.userToken, running: true });

    if (checkIfFarming) {
        res.send({ state: 'error', message: 'Already farming' });
    } else {
        let channelId = req.body.channelId;

        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }

        function isEmoji(str) {
            var ranges = [
                '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])' // U+1F680 to U+1F6FF
            ];
            if (str.match(ranges.join('|'))) {
                return true;
            } else {
                return false;
            }
        }

        const client = new Discord.Client({
            allowedMentions: {
                // set repliedUser value to `false` to turn off the mention by default
                repliedUser: true
            }
        });

        client.on('ready', async() => {
            console.log(`Logged in as ${client.user.tag}!`);
            const checkIfBotExists = await levelFarms.findOne({ discordId: req.body.userToken, botName: client.user.tag });

            if (!checkIfBotExists) {
                await levelFarms.create({
                    discordId: req.body.userToken,
                    running: true,
                    channelId: req.body.channelId,
                    messageDelay: req.body.messageDelay,
                    start_date: new Date(),
                    messages: [],
                    botName: client.user.tag,
                    botAvatar: client.user.avatarURL(),
                    botToken: req.body.token,
                    mintDate: req.body.mintDate,
                    collectionName: req.body.collectionName
                });
            } else {
                await levelFarms.updateOne(checkIfBotExists, { running: true });
            }

            await getAllFarms();
            res.send({ state: 'success', message: 'Started Farming' });


            // Set the date we're counting down to
            let minutesToAdd = req.body.messageDelay;
            let currentDate = new Date();
            let countDownDate = new Date(currentDate.getTime() + (minutesToAdd * 60000)).getTime();
            let countDownDistance;

            // Update the count down every 1 second
            var x = setInterval(function() {
                // Get today's date and time
                var now = new Date().getTime();
                // Find the distance between now and the count down date
                countDownDistance = countDownDate - now;
            }, 1000);

            let currentlyChecking = false;
            let channelIdToCheck = req.body.channelId;

            client.on("message", async function(message) {
                let checkIfBotNeedsShutdown = await allFarmData.find(obj => {
                    return (obj.discordId === req.body.userToken && obj.botName === client.user.tag)
                });

                if (checkIfBotNeedsShutdown.running === false) {
                    console.log('Shutting bot down...');
                    clearInterval(x);
                    client.destroy();
                    return;
                }
                if (message.author.bot) return;
                if (message.channel.id != channelIdToCheck) return;
                if (message.mentions.users.get(client.user.id)) {
                    if (message.mentions.users.get(client.user.id).id === client.user.id) {

                        currentlyChecking = true;
                        const checkIfBotRunning = await levelFarms.findOne({ discordId: req.body.userToken, botName: client.user.tag });
                        if (checkIfBotRunning) {
                            if (checkIfBotRunning.running) {
                                channelIdToCheck = checkIfBotRunning.channelId;
                                (async() => {
                                    await sleep((10000 * Math.random()) + 1000);
                                    await axios({
                                        method: 'post',
                                        url: "https://beta.rudolphaio.com/api/askRudolph",
                                        data: {
                                            botData: checkIfBotRunning,
                                            text: message.content, // This is the body part
                                        }
                                    }).then(async function(response) {
                                        response = response.data;

                                        if (response == undefined || response == '') {
                                            currentlyChecking = false;
                                            return;
                                        } else {
                                            message.inlineReply(`${response}`);
                                        }
                                        let data = checkIfBotRunning.messages;
                                        data.push({ messageAuthor: message.author.tag, message: message.content, response: response });
                                        if (data.length > 20) {
                                            data.shift();
                                        }

                                        await levelFarms.findOneAndUpdate({ discordId: req.body.userToken, botName: client.user.tag }, { messages: data });
                                        minutesToAdd = checkIfBotRunning.messageDelay;
                                        currentDate = new Date();
                                        countDownDate = new Date(currentDate.getTime() + (minutesToAdd + 0.1) * 60000).getTime();
                                        setTimeout(() => { currentlyChecking = false }, 1000);
                                    });
                                })();
                            } else {
                                console.log('Shutting bot down...');
                                clearInterval(x);
                                client.destroy();
                            }
                        } else {
                            console.log('Shutting bot down...');
                            clearInterval(x);
                            client.destroy();
                        }
                    } else {
                        return;
                    }
                } else {
                    if (countDownDistance > 0 || currentlyChecking) return;
                    currentlyChecking = true;

                    const checkIfBotRunning = await levelFarms.findOne({ discordId: req.body.userToken, botName: client.user.tag });
                    if (checkIfBotRunning) {
                        if (checkIfBotRunning.running) {
                            channelIdToCheck = checkIfBotRunning.channelId;
                            (async() => {
                                await sleep((10000 * Math.random()) + 1000);
                                await axios({
                                    method: 'post',
                                    url: "https://beta.rudolphaio.com/api/askRudolph",
                                    data: {
                                        botData: checkIfBotRunning,
                                        text: message.content, // This is the body part
                                    }
                                }).then(async function(response) {
                                    response = response.data;

                                    if (response == undefined || response == '') {
                                        currentlyChecking = false;
                                        return;
                                    } else {
                                        message.inlineReply(`${response}`);
                                    }
                                    let data = checkIfBotRunning.messages;
                                    data.push({ messageAuthor: message.author.tag, message: message.content, response: response });
                                    if (data.length > 20) {
                                        data.shift();
                                    }

                                    await levelFarms.findOneAndUpdate({ discordId: req.body.userToken, botName: client.user.tag }, { messages: data });
                                    minutesToAdd = checkIfBotRunning.messageDelay;
                                    currentDate = new Date();
                                    countDownDate = new Date(currentDate.getTime() + (minutesToAdd + 0.1) * 60000).getTime();
                                    setTimeout(() => { currentlyChecking = false }, 1000);
                                });
                            })();
                        } else {
                            console.log('Shutting bot down...');
                            clearInterval(x);
                            client.destroy();
                        }
                    } else {
                        console.log('Shutting bot down...');
                        clearInterval(x);
                        client.destroy();
                    }
                }
            });
        });

        client.login(req.body.token);
    }
}