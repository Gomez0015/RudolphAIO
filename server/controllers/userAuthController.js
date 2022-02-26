const dashboardKeys = require('../models/dashboardKeysModel.js');
const axios = require('axios');

exports.checkAuthDiscord = async function(req, res) {
    const data = await dashboardKeys.findOne({ discordId: req.body.discordId });

    if (data) {
        if (req.body.discordLogin && req.body.authToken == data.authToken) {
            await dashboardKeys.findOneAndUpdate({ discordId: req.body.discordId }, { lastLoginIp: req.headers['x-forwarded-for'] });
            res.send(data);
        } else {
            if (data.lastLoginIp === (req.headers['x-forwarded-for'])) {
                res.send(data);
            } else {
                res.send({ state: 'error', message: 'You have been logged out' });
            }
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

    if (allKeys.length >= 75) {
        res.send({ state: 'error', message: 'Out of stock!' });
    } else {
        const checkUserHasKey = await dashboardKeys.findOne({ discordId: req.body.discordId });
        if (checkUserHasKey) {
            res.send({ state: 'error', message: 'You already have a key!' });
        } else {
            res.send({ state: 'success', message: 'You are avialable to generate a key!' });
        }
    }
}

exports.generateNewKey = async function(req, res) {
    const checkUserHasKey = await dashboardKeys.findOne({ discordId: req.body.discordId });
    await axios.get('https://public-api.solscan.io/transaction/' + req.body.signature).then(async function(response) {
        // let now = new Date();
        // const thirtyminutes = 1800000;

        // console.log(now, new Date(response.data.blockTime), moment.utc(moment(now, "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(response.data.blockTime), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"));

        // if ((now - (new Date(response.data.blockTime))) < thirtyminutes) {
        if (response.data.solTransfers[0].destination == '9St1VZtnsTQ8KLvjjySt4Ra5k2PX8HpoLCTau86t3imZ') {
            if (response.data.status.toLowerCase() == "success") {
                // if (process.env.WHITE_LIST.includes(req.body.discordId)) {
                // } else {
                //     console.log('no whitelist error', req.body.discordId, req.body.signature);
                //     res.send({ state: 'error', message: 'You are not whitelisted!' });
                // }
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
                    await dashboardKeys.create({ key: generatedKey.toUpperCase(), discordId: req.body.discordId, expired: 'false', start_date: new Date() });
                    res.send({ state: 'success', message: 'Key has been generated, you can now login!' });
                } else {
                    console.log('recall function, key already exists', req.body.discordId, req.body.signature, 5);
                    res.send({ state: 'error', message: 'Contact a server Administrator, an error has occurred' });
                }
            } else {
                console.log('solana transaction failed', req.body.discordId, req.body.signature, 4);
                res.send({ state: 'error', message: 'SOL Transactions Failed! Contact a server Administrator, if this is false' });
            }
        } else {
            console.log('solana transaction failed', req.body.discordId, req.body.signature, 3);
            res.send({ state: 'error', message: 'SOL Transactions Failed! Contact a server Administrator, if this is false' });
        }
        // } else {
        //     console.log('solana transaction failed', req.body.discordId, req.body.signature, 2);
        //     res.send({ state: 'error', message: 'SOL Transactions Failed! Contact a server Administrator, if this is false' });
        // }
    }).catch((err) => {
        console.log('axios request for solscan had an error', req.body.discordId, req.body.signature, 1);
        res.send({ state: 'error', message: 'Contact a server Administrator, an error has occurred' })
    });
}