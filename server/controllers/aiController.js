var axios = require('axios');
const Discord = require('discord.js-selfbot');
const levelFarms = require('../models/levelFarmModel');
var randomSpam = require('./spam.json');
require('dotenv').config();
var fs = require('fs');
const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
let chatLogs = '';
var mention_pattern = /<@.?[0-9]*?>/g;
var Filter = require('bad-words'),
    filter = new Filter();

fs.readFile('./prompt.txt', 'utf8', function(err, data) {
    chatLogs = data;
});

function isUpperCase(str) {
    return str === str.toUpperCase();
}

exports.getAnswer = async function(res, req) {
    let tempChatLogs = req.body.chatLogs;
    if (tempChatLogs.length >= 7000) {
        tempChatLogs = tempChatLogs.split(/Human:(.*)/);
        tempChatLogs = tempChatLogs[0] + ("Human:" + ((tempChatLogs[1]).slice(500).split(/Human:(.*)/)[1]));
    }
    tempChatLogs += `Human: ${req.body.text.replace(mention_pattern, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, 'link')}\n`;

    let mathString = req.body.text.replace(mention_pattern, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, 'link').replace(/\s/g, '');

    var total = 0;
    mathString = mathString.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];

    if (req.body.text.replace(mention_pattern, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') == '') {
        res.send({ data: undefined });
    } else if (mathString.length > 0) {
        while (mathString.length) {
            total += parseFloat(mathString.shift());
        }

        tempChatLogs += `AI: ${total}\n`;

        res.send({ answer: total, chatLogs: tempChatLogs });
    } else {
        await openai.complete({
                engine: 'babbage',
                prompt: tempChatLogs,
                maxTokens: 50,
                temperature: 0.9,
                topP: 1,
                presencePenalty: 0.6,
                frequencyPenalty: 0,
                stop: ["\n", " Human:", " AI:"]
            }).then(function(response) {
                tempChatLogs += `${response.data.choices[0].text.replace(mention_pattern, '')}\n`;
                answer = filter.clean(response.data.choices[0].text.substr(4).replace(/^[a-zA-Z]+:/, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, 'link').replace(mention_pattern, ''));

                if (isUpperCase(answer)) {
                    answer = answer.toLowerCase();
                }

                res.send({ answer: answer, chatLogs: tempChatLogs });
            })
            .catch(err => {
                if (err.isAxiosError) {
                    console.log(err, ', Axios Error', req.body.botData.botName);
                }
                res.send({ data: undefined });
            });
    }
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
    await getAllFarms();
    const data = await levelFarms.findOne({ discordId: req.body.userToken, state: 1 });
    if (data) {
        await levelFarms.updateOne(data, { state: 2 });
        res.send({ state: 'success', message: 'Successfully stopped bot' });
    } else {
        res.send({ state: 'error', message: 'You have no bots currently farming' });
    }
}

exports.updateBotSettings = async function(res, req) {
    const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });
    if (data) {
        await levelFarms.updateOne(data, { endTimer: req.body.botData.endTimer, messageDelay: req.body.botData.messageDelay, channelId: req.body.botData.channelId, collectionName: req.body.botData.collectionName, mintDate: req.body.botData.mintDate, customPrompt: req.body.botData.customPrompt, spam: req.body.botData.spam, delete: req.body.botData.delete });
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
    let checkIfFarming = await levelFarms.findOne({ discordId: req.body.userToken, state: 1 });

    let checkIfFarmingState;

    if (checkIfFarming) {
        checkIfFarmingState = checkIfFarming.state;
    } else {
        checkIfFarmingState = 0;
    }

    console.log(checkIfFarming, checkIfFarmingState);

    if (checkIfFarmingState == 1) {
        res.send({ state: 'error', message: 'Already farming' });
    } else if (checkIfFarmingState == 2) {
        res.send({ state: 'error', message: 'Wait for last bot to fully shutdown...' });
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

        require("./customLibraries/extendedMessage");

        const client = new Discord.Client({
            allowedMentions: {
                // set repliedUser value to `false` to turn off the mention by default
                repliedUser: true
            }
        });

        client.on('ready', async() => {
            console.log(`Logged in as ${client.user.tag}!`);
            let checkIfBotExists = await levelFarms.findOne({ discordId: req.body.userToken, botName: client.user.tag });

            if (!checkIfBotExists) {
                const newBot = await levelFarms.create({
                    discordId: req.body.userToken,
                    channelId: req.body.channelId,
                    messageDelay: req.body.messageDelay,
                    start_date: new Date(),
                    endTimer: req.body.endTimer,
                    messages: [],
                    botName: client.user.tag,
                    botAvatar: client.user.avatarURL() == null ? 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png' : client.user.avatarURL(),
                    botToken: req.body.token,
                    mintDate: req.body.mintDate,
                    collectionName: req.body.collectionName,
                    state: 1,
                    customPrompt: req.body.customPrompt,
                    spam: req.body.spam,
                    delete: req.body.delete
                });
                checkIfBotExists = newBot;
            } else {
                await levelFarms.updateOne(checkIfBotExists, { start_date: new Date(), endTimer: checkIfBotExists.endTimer, state: 1, botName: client.user.tag, botAvatar: client.user.avatarURL() == null ? 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png' : client.user.avatarURL(), });
            }

            await getAllFarms();

            let channelExists = await client.channels.cache.get(checkIfBotExists.channelId);

            if (channelExists) {
                res.send({ state: 'success', message: 'Started Farming' });

            } else {
                res.send({ state: 'error', message: 'No Access to Channel!' });

            }

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

            let botChatLogs = chatLogs.replace('{botName}', client.user.tag.split('#')[0]).replace('{botName}', client.user.tag.split('#')[0]).replace('{botName}', client.user.tag.split('#')[0]).replace('{collectionName}', req.body.collectionName).replace('{mintDate}', req.body.mintDate).replace('{customPrompt}', (req.body.customPrompt + ' \n\nHuman: Hey!\nAI: Hello!\n'));

            let messagesThatNeedReply = [];

            let lastResponder = '';
            let totalMessagesWithLastResponder = 0;

            let lastResponse = '';
            let lastMessage;

            client.on("message", async function(message) {
                let checkIfBotNeedsShutdown = await allFarmData.find(obj => {
                    return (obj.discordId === req.body.userToken && obj.state == 1)
                });

                channelExists = false;

                if (checkIfBotNeedsShutdown) {
                    channelExists = await client.channels.cache.get(checkIfBotNeedsShutdown.channelId);
                }

                if (!checkIfBotNeedsShutdown || !channelExists) {
                    console.log('Shutting bot down...');
                    clearInterval(x);
                    try {
                        await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                    } catch (e) {
                        console.log(e, 69);
                    }
                    client.destroy();
                    return;
                }

                const currentDateForTimer = new Date();
                const minutes = parseInt(Math.abs(currentDateForTimer.getTime() - checkIfBotNeedsShutdown.start_date.getTime()) / (1000 * 60));

                if (minutes >= checkIfBotNeedsShutdown.endTimer) {
                    console.log('Shutting bot down...');
                    clearInterval(x);
                    await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                    client.destroy();
                    return;
                }

                if (checkIfBotNeedsShutdown.state === 0 || checkIfBotNeedsShutdown.state == 2) {
                    console.log('Shutting bot down...');
                    clearInterval(x);
                    await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                    client.destroy();
                    return;
                }

                if (message.author.bot) return;
                if (message.author.id == client.user.id) return;
                if (message.channel.id != channelIdToCheck) return;

                if (message.mentions.users.get(client.user.id)) {
                    if (currentlyChecking) { messagesThatNeedReply.push(message); return; };
                    currentlyChecking = true;
                    if (lastResponder == message.author.id) {
                        totalMessagesWithLastResponder++;
                    }
                    if (totalMessagesWithLastResponder >= 20) {
                        totalMessagesWithLastResponder = 0;
                        lastResponder = '';
                        return;
                    }
                    lastResponder = message.author.id;
                    const checkIfBotRunning = await levelFarms.findOne({ discordId: req.body.userToken, botName: client.user.tag });
                    if (checkIfBotRunning) {
                        if (checkIfBotRunning.state === 1) {
                            channelIdToCheck = checkIfBotRunning.channelId;
                            await sleep((10000 * Math.random()) + 1000);
                            await axios({
                                method: 'post',
                                url: process.env.SERVER_URI + "/api/askRudolph",
                                data: {
                                    botData: checkIfBotRunning,
                                    text: message.content, // This is the body part
                                    chatLogs: botChatLogs,
                                }
                            }).then(async function(response) {
                                answer = response.data.answer;

                                if (answer == undefined || answer == '') {
                                    currentlyChecking = false;
                                    return;
                                } else {
                                    botChatLogs = response.data.chatLogs;
                                    message.inlineReply(`${answer}`);
                                }

                                let data = checkIfBotRunning.messages;
                                data.push({ messageAuthor: message.author.tag, message: message.content, response: answer, timeStamp: new Date() });
                                if (data.length > 20) {
                                    data.shift();
                                }

                                for (let x = 0; x < messagesThatNeedReply.length; x++) {
                                    await sleep((3000 * Math.random()) + 1000);
                                    await axios({
                                        method: 'post',
                                        url: process.env.SERVER_URI + "/api/askRudolph",
                                        data: {
                                            botData: checkIfBotRunning,
                                            text: messagesThatNeedReply[x].content, // This is the body part
                                            chatLogs: botChatLogs,
                                        }
                                    }).then(async function(response) {
                                        answer = response.data.answer;

                                        if (answer == undefined || answer == '') {
                                            return;
                                        } else {
                                            botChatLogs = response.data.chatLogs;
                                            messagesThatNeedReply[x].inlineReply(`${answer}`);
                                        }

                                        data.push({ messageAuthor: messagesThatNeedReply[x].author.tag, message: messagesThatNeedReply[x].content, response: answer, timeStamp: new Date() });
                                        if (data.length > 20) {
                                            data.shift();
                                        }
                                        messagesThatNeedReply.splice(x, 1);
                                    });
                                }

                                await levelFarms.findOneAndUpdate({ discordId: req.body.userToken, botName: client.user.tag }, { messages: data });
                                minutesToAdd = checkIfBotRunning.messageDelay;
                                currentDate = new Date();
                                countDownDate = new Date(currentDate.getTime() + (minutesToAdd + 0.1) * 60000).getTime();
                                setTimeout(() => { currentlyChecking = false }, 1000);
                            });
                        } else {
                            console.log('Shutting bot down...');
                            clearInterval(x);
                            await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                            client.destroy();
                        }
                    } else {
                        console.log('Shutting bot down...');
                        clearInterval(x);
                        await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                        client.destroy();
                    }
                } else {
                    if (countDownDistance > 0 || currentlyChecking) return;
                    currentlyChecking = true;

                    const checkIfBotRunning = await levelFarms.findOne({ discordId: req.body.userToken, botName: client.user.tag });
                    if (checkIfBotRunning) {
                        if (checkIfBotRunning.state == 1) {
                            channelIdToCheck = checkIfBotRunning.channelId;
                            await sleep((10000 * Math.random()) + 1000);

                            if (checkIfBotRunning.spam) {
                                answer = randomSpam.spam[Math.floor(Math.random() * randomSpam.spam.length)];

                                while (answer == lastResponse) {
                                    answer = randomSpam.spam[Math.floor(Math.random() * randomSpam.spam.length)];
                                }

                                if (answer == undefined || answer == '') {
                                    currentlyChecking = false;
                                    return;
                                } else {
                                    if (checkIfBotRunning.delete && lastMessage) {
                                        await lastMessage.delete();
                                    }
                                    message.channel.send(`${answer}`).then(msg => {
                                        lastMessage = msg;
                                    });
                                }

                                let data = checkIfBotRunning.messages;
                                data.push({ messageAuthor: message.author.tag, message: message.content, response: answer, timeStamp: new Date() });
                                if (data.length > 20) {
                                    data.shift();
                                }

                                await levelFarms.findOneAndUpdate({ discordId: req.body.userToken, botName: client.user.tag }, { messages: data });
                                minutesToAdd = checkIfBotRunning.messageDelay;
                                currentDate = new Date();
                                countDownDate = new Date(currentDate.getTime() + (minutesToAdd + 0.1) * 60000).getTime();
                                setTimeout(() => { currentlyChecking = false }, 1000);
                                lastResponse = answer;
                            } else {
                                await axios({
                                    method: 'post',
                                    url: process.env.SERVER_URI + "/api/askRudolph",
                                    data: {
                                        botData: checkIfBotRunning,
                                        text: message.content, // This is the body part
                                        chatLogs: botChatLogs
                                    }
                                }).then(async function(response) {
                                    answer = response.data.answer;

                                    if (answer == undefined || answer == '') {
                                        currentlyChecking = false;
                                        return;
                                    } else {
                                        message.inlineReply(`${answer}`);
                                    }
                                    let data = checkIfBotRunning.messages;
                                    data.push({ messageAuthor: message.author.tag, message: message.content, response: answer, timeStamp: new Date() });
                                    if (data.length > 20) {
                                        data.shift();
                                    }

                                    await levelFarms.findOneAndUpdate({ discordId: req.body.userToken, botName: client.user.tag }, { messages: data });
                                    minutesToAdd = checkIfBotRunning.messageDelay;
                                    currentDate = new Date();
                                    countDownDate = new Date(currentDate.getTime() + (minutesToAdd + 0.1) * 60000).getTime();
                                    setTimeout(() => { currentlyChecking = false }, 1000);
                                });
                            }
                        } else {
                            console.log('Shutting bot down...');
                            clearInterval(x);
                            await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                            client.destroy();
                        }
                    } else {
                        console.log('Shutting bot down...');
                        clearInterval(x);
                        await levelFarms.updateOne({ discordId: req.body.userToken, botName: client.user.tag }, { state: 0 });
                        client.destroy();
                    }
                }
            });
        });

        client.login(req.body.token);
    }
}