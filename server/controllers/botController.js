const levelFarms = require('../models/levelFarmModel');
const dashboardKeys = require('../models/dashboardKeysModel');
const { encrypt, decrypt } = require('./encryptionController');
const serverData = require('../server.js');
const Discord = require('discord.js-selfbot');
const axios = require('axios');

exports.createBot = async function(req, res) {
    let allFarmData = serverData.allFarmData;

    const client = new Discord.Client();

    client.login(req.body.botToken).catch(err => {
        console.log(err.message);
        res.send({ state: 'error', message: err.message });
        return;
    });

    client.on('ready', async() => {
        console.log(`Logged in as ${client.user.tag}!`);

        let checkIfBotExists = await allFarmData.find(obj => {
            return (obj.discordId === req.body.userToken && decrypt(obj.botToken) === req.body.botToken);
        });

        let avatar = 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'
        if (client.user.avatarURL() != null) {
            avatar = client.user.avatarURL();
        }

        if (!checkIfBotExists) {
            await allFarmData.push({
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
            });
            res.send({ state: 'success', message: 'Bot has been created!' });
            serverData.updateFarmData(allFarmData);
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
    let allFarmData = serverData.allFarmData;

    // const botData = await levelFarms.find({ discordId: req.body.userToken });
    const botData = await allFarmData.filter(obj => {
        return (obj.discordId === req.body.userToken)
    });

    const userData = await dashboardKeys.find({ discordId: req.body.userToken });
    if (botData) {
        if (userData) {
            if (userData[0].authToken == req.body.authToken) {
                botData.forEach(obj => {
                    obj.botToken = decrypt(obj.botToken);
                });

                let data = { botList: botData, userChatLogs: userData[0].chatLogs }
                res.send(data);
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
    let allFarmData = serverData.allFarmData;
    // const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });
    const data = await allFarmData.find(obj => {
        return (obj.discordId === req.body.userToken && obj.botName === req.body.botData.botName);
    });
    if (data) {
        // await levelFarms.updateOne(data, { endTimer: req.body.botData.endTimer, messageDelay: req.body.botData.messageDelay, channelId: req.body.botData.channelId, collectionName: req.body.botData.collectionName, mintDate: req.body.botData.mintDate, customPrompt: req.body.botData.customPrompt, spam: req.body.botData.spam, delete: req.body.botData.delete });
        let botIndex = allFarmData.findIndex((obj => obj == data));
        allFarmData[botIndex].endTimer = req.body.botData.endTimer;
        allFarmData[botIndex].messageDelay = req.body.botData.messageDelay;
        allFarmData[botIndex].channelId = req.body.botData.channelId;
        allFarmData[botIndex].collectionName = req.body.botData.collectionName;
        allFarmData[botIndex].mintDate = req.body.botData.mintDate;
        allFarmData[botIndex].customPrompt = req.body.botData.customPrompt;
        allFarmData[botIndex].spam = req.body.botData.spam;
        allFarmData[botIndex].delete = req.body.botData.delete;

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

    serverData.updateFarmData(allFarmData);
}


exports.deleteBot = async function(res, req) {
    let allFarmData = serverData.allFarmData;
    // const data = await levelFarms.findOne({ discordId: req.body.userToken, botName: req.body.botData.botName });
    const data = await allFarmData.find(obj => {
        return (obj.discordId === req.body.userToken && obj.botName === req.body.botData.botName);
    });
    if (data) {
        // await levelFarms.deleteOne(data);
        allFarmData = allFarmData.filter((obj) => obj != data);

        const checkArraylength = await dashboardKeys.findOne({ discordId: req.body.userToken });
        if (checkArraylength.chatLogs.length >= 20) {
            checkArraylength.chatLogs.shift();
        }
        checkArraylength.chatLogs.push(`Deleted Bot ${data.botName} @ ${new Date()}`);
        await dashboardKeys.updateOne({ discordId: req.body.userToken }, { $set: { chatLogs: checkArraylength.chatLogs } });

        // await getAllFarms();
        res.send({ state: 'success', message: 'Successfully deleted bot' });
    } else {
        res.send({ state: 'error', message: 'Couldnt seem to find the bot' });
    }

    serverData.updateFarmData(allFarmData);
}

exports.solveCaptcha = async function(res, req) {
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    await axios({ method: 'post', url: `http://2captcha.com/in.php`, data: { json: 1, key: req.body.apiKey, method: req.body.method, sitekey: req.body.captcha_sitekey, pageurl: 'https://discordapp.com/api/v6/invites/' + req.body.serverCode } }).then(async(response) => {
        if (response.data.status == 0) {
            res.send({ state: 'error', message: response.data.error_text });
        } else {
            let done = false;
            while (!done) {
                await sleep(5000);
                await (async() => {
                    await axios({ method: 'get', url: `http://2captcha.com/res.php?action=get&key=${req.body.apiKey}&id=${response.data.request}&json=1` }).then(response => {
                        if (response.data.status == 0) {
                            if (!(response.data.request == 'CAPCHA_NOT_READY')) {
                                res.send({ state: 'error', message: response.data.request });
                                done = true;
                            }
                        } else {
                            let captchaSolved = response.data.request;

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