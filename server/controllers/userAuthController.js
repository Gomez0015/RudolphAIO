const dashboardKeys = require('../models/dashboardKeysModel.js');
const axios = require('axios');
let awaitingPayements = [];

exports.checkAuthDiscord = async function(req, res) {
    const data = await dashboardKeys.findOne({ discordId: req.body.discordId });

    if (data) {
        if (req.body.discordLogin && req.body.authToken == data.authToken) {
            await dashboardKeys.findOneAndUpdate({ discordId: req.body.discordId }, { lastLoginIp: req.headers['x-forwarded-for'] });
            res.send(data);
        } else if (req.body.authToken == data.authToken) {
            if (data.lastLoginIp === (req.headers['x-forwarded-for'])) {
                res.send(data);
            } else {
                res.send({ state: 'error', message: 'You have been logged out' });
            }
        } else {
            res.send({ state: 'error', message: 'You have been logged out' });
        }
    } else {
        res.send({ state: 'error', message: 'No key linked with this discord account.', key: 'none' });
    }
}

exports.linkKeyDiscord = async function(res, req, db) {
    const checkKeyExists = await dashboardKeys.findOne({ key: req.body.authKey });
    if (checkKeyExists) {
        const checkDiscordLinked = await dashboardKeys.findOne({ discordId: req.body.discordId });
        if (checkDiscordLinked || checkKeyExists.discordId != 'none') {
            res.send({ state: 'error', message: 'Discord ID or Key is already linked' });
        } else {
            const data = await dashboardKeys.findOneAndUpdate({ key: req.body.authKey }, { discordId: req.body.discordId, lastLoginIp: (req.headers['x-forwarded-for']) });
            data.discordId = req.body.discordId;
            data.lastLoginIp = req.headers['x-forwarded-for'];
            res.send(data);
        }
    } else {
        res.send({ state: 'error', message: 'Key does not exist' });
    }
}

exports.checkKeyAvailability = async function(req, res) {
    const allKeys = await dashboardKeys.find({});

    // if (allKeys.length >= 60) {
    //     res.send({ state: 'error', message: 'Out of stock!' });
    // } else {
    // const checkUserHasKey = await dashboardKeys.findOne({ discordId: req.body.discordId });
    // if (checkUserHasKey) {
    //     res.send({ state: 'error', message: 'You already have a key!' });
    // } else {
    awaitingPayements.push(req.body.userWallet);
    res.send({ state: 'success', message: 'You are available to generate a key!' });
    // }
    // }
}

exports.generateNewKey = async function(req, res) {
    const checkUserHasKey = await dashboardKeys.findOne({ discordId: req.body.discordId });
    await axios.get('https://public-api.solscan.io/transaction/' + req.body.signature).then(async function(response) {
        if (response.data.solTransfers[0].destination == '9St1VZtnsTQ8KLvjjySt4Ra5k2PX8HpoLCTau86t3imZ') {
            if (awaitingPayements.includes(response.data.solTransfers[0].source)) {
                if (response.data.status.toLowerCase() == "success") {
                    async function genKey(length) {
                        // Use crypto.getRandomValues if available
                        if (
                            typeof crypto !== 'undefined' &&
                            typeof crypto.getRandomValues === 'function'
                        ) {
                            var tmp = new Uint8Array(Math.max((~~length) / 2));
                            crypto.getRandomValues(tmp);
                            return Array.from(tmp)
                                .map(n => ('0' + n.toString(16)).substr(-2))
                                .join('')
                                .substr(0, length);
                        }

                        // fallback to Math.getRandomValues
                        var ret = "";
                        while (ret.length < length) {
                            ret += Math.random().toString(16).substring(2);
                        }
                        return ret.substring(0, length);
                    }

                    const generatedKey = await genKey(29);
                    const checkKeyExists = await dashboardKeys.findOne({ key: generatedKey });

                    if (!checkKeyExists) {
                        if (checkUserHasKey) {
                            await dashboardKeys.updateOne({ discordId: req.body.discordId }, { expired: 'false', start_date: new Date() });
                            awaitingPayements.splice(awaitingPayements.indexOf(response.data.solTransfers[0].source), 1);
                            res.send({ state: 'success', message: 'Key has been renewed, you can now login!' });
                        } else {
                            await dashboardKeys.create({ key: generatedKey.toUpperCase(), discordId: req.body.discordId, expired: 'false', start_date: new Date() });
                            awaitingPayements.splice(awaitingPayements.indexOf(response.data.solTransfers[0].source), 1);
                            res.send({ state: 'success', message: 'Key has been bought, you can now login!' });
                        }
                    } else {
                        console.log('recall function, key already exists', req.body.discordId, req.body.signature, 6);
                        awaitingPayements.splice(awaitingPayements.indexOf(response.data.solTransfers[0].source), 1);
                        res.send({ state: 'error', message: 'Contact a server Administrator, an error has occurred' });
                    }
                } else {
                    console.log('solana transaction failed', req.body.discordId, req.body.signature, 5);
                    awaitingPayements.splice(awaitingPayements.indexOf(response.data.solTransfers[0].source), 1);
                    res.send({ state: 'error', message: 'SOL Transactions Failed! Contact a server Administrator, if this is false' });
                }
            } else {
                console.log('solana transaction failed', req.body.discordId, req.body.signature, 4);
                res.send({ state: 'error', message: 'SOL Transactions Failed! Contact a server Administrator, if this is false' });
            }
        } else {
            console.log('solana transaction failed', req.body.discordId, req.body.signature, 3);
            res.send({ state: 'error', message: 'SOL Transactions Failed! Contact a server Administrator, if this is false' });
        }
    }).catch((err) => {
        console.log('axios request for solscan had an error', req.body.discordId, req.body.signature, 1);
        res.send({ state: 'error', message: 'Contact a server Administrator, an error has occurred' })
    });
}