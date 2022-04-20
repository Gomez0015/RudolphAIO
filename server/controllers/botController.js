const levelFarms = require('../models/levelFarmModel');
const dashboardKeys = require('../models/dashboardKeysModel');
const { encrypt, decrypt } = require('./encryptionController');
const Discord = require('discord.js-selfbot');
const axios = require('axios');
const serverData = require('../server.js');

exports.createBot = async function(req, res) {

    const client = new Discord.Client();

    client.login(req.body.botToken).catch(err => {
        console.log(err.message);
        res.send({ state: 'error', message: err.message });
        return;
    });

    client.on('ready', async() => {
        console.log(`Logged in as ${client.user.tag}!`);

        let checkIfBotExists = await levelFarms.findOne({ discordId: req.body.userToken, botToken: req.body.botToken });

        let avatar = 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'
        if (client.user.avatarURL() != null) {
            avatar = client.user.avatarURL();
        }

        if (!checkIfBotExists) {
            await levelFarms.create({
                discordId: req.body.userToken,
                channelId: 'none',
                messageDelay: 1,
                start_date: new Date(),
                endTimer: 300,
                messages: [],
                botName: client.user.tag,
                botAvatar: avatar,
                botToken: encrypt(req.body.botToken),
                mintDate: 'none',
                collectionName: 'none',
                state: 0,
                customPrompt: 'none',
                spam: false,
                delete: false,
                instantDelete: false,
                webhook: '',
            });
            res.send({ state: 'success', message: 'Bot has been created!' });
            client.destroy();
            return;
        } else {
            res.send({ state: 'error', message: 'This bot already exists!' });
            client.destroy();
            return;
        }
    });
}

exports.getBots = async function(res, req) {
    const botData = await levelFarms.find({ discordId: req.body.userToken });

    const tempBotData = [...botData];

    const userData = await dashboardKeys.find({ discordId: req.body.userToken });
    if (tempBotData) {
        if (userData) {
            if (userData[0].authToken == req.body.authToken) {
                await tempBotData.forEach(obj => {
                    obj.botToken = decrypt(obj.botToken);
                });

                let data = { botList: tempBotData, userChatLogs: userData[0].chatLogs }
                res.send(data);
                await tempBotData.forEach(obj => {
                    obj.botToken = encrypt(obj.botToken);
                });
            } else {
                res.send([]);
            }
        } else {
            res.send([]);
        }
    } else {
        res.send([]);
    }
}

exports.updateBotSettings = async function(res, req) {
    const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });

    if (data) {
        await levelFarms.updateOne(data, { endTimer: req.body.botData.endTimer, messageDelay: req.body.botData.messageDelay, channelId: req.body.botData.channelId, collectionName: req.body.botData.collectionName, mintDate: req.body.botData.mintDate, customPrompt: req.body.botData.customPrompt, spam: req.body.botData.spam, delete: req.body.botData.delete, instantDelete: req.body.botData.instantDelete, webhook: req.body.botData.webhook });

        const checkArraylength = await dashboardKeys.findOne({ discordId: req.body.userToken });
        if (checkArraylength.chatLogs.length >= 20) {
            checkArraylength.chatLogs.shift();
        }
        checkArraylength.chatLogs.push(`Updated Bot ${data.botName} @ ${new Date()}`);
        await dashboardKeys.updateOne({ discordId: req.body.userToken }, { $set: { chatLogs: checkArraylength.chatLogs } });

        res.send({ state: 'success', message: 'Successfully updated settings' });
    } else {
        res.send({ state: 'error', message: 'Couldnt seem to find the bot' });
    }
}


exports.deleteBot = async function(res, req) {
    const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });

    if (data) {
        await levelFarms.deleteOne(data);

        const checkArraylength = await dashboardKeys.findOne({ discordId: req.body.userToken });
        if (checkArraylength.chatLogs.length >= 20) {
            checkArraylength.chatLogs.shift();
        }
        checkArraylength.chatLogs.push(`Deleted Bot ${data.botName} @ ${new Date()}`);
        await dashboardKeys.updateOne({ discordId: req.body.userToken }, { $set: { chatLogs: checkArraylength.chatLogs } });

        res.send({ state: 'success', message: 'Successfully deleted bot' });
    } else {
        res.send({ state: 'error', message: 'Couldnt seem to find the bot' });
    }
}

exports.solveCaptcha = async function(res, req) {
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    await axios({
        method: 'post',
        url: `https://api.capmonster.cloud/createTask`,
        data: {
            clientKey: req.body.apiKey,
            task: {
                type: 'HCaptchaTaskProxyless',
                websiteKey: req.body.captcha_sitekey,
                websiteURL: 'https://discordapp.com/api/v6/invites/' + req.body.serverCode
            }
        }
    }).then(async(response) => {
        console.log(response.data);
        if (response.data.errorId != 0) {
            res.send({ state: 'error', message: response.data.error_text });
        } else {
            let done = false;
            while (!done) {
                await sleep(3000);
                await (async() => {
                    await axios({
                        method: 'post',
                        url: `https://api.capmonster.cloud/getTaskResult`,
                        data: {
                            clientKey: req.body.apiKey,
                            taskId: response.data.taskId
                        }
                    }).then(response => {
                        if (response.data.status == 'ready') {
                            let captchaSolved = response.data.solution.gRecaptchaResponse;

                            done = true;
                            res.send({ state: 'success', captchaSolved: captchaSolved });
                        }
                    }).catch(err => {
                        res.send({ state: 'error', message: err.message });
                    });
                })();
                await sleep(1000);
            }
        }
    }).catch(err => {
        res.send({ state: 'error', message: err.message });
    });
}