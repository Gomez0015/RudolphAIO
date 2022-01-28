const dashboardKeys = require('../models/dashboardKeysModel.js');

exports.checkAuthDiscord = async function(req, res) {
    const data = await dashboardKeys.findOne({ discordId: req.body.discordId });
    if (data) {
        if (req.body.discordLogin) {
            await dashboardKeys.findOneAndUpdate({ discordId: req.body.discordId }, { lastLoginIp: req.headers['x-forwarded-for'] });
            res.send(data);
        } else {
            console.log(req.headers['x-forwarded-for'], req.headers('x-forwarded-for'));
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

exports.generateNewKey = async function(req, res) {
    const checkUserHasKey = await dashboardKeys.findOne({ discordId: req.body.discordId });
    if (checkUserHasKey) {
        res.send({ state: 'error', message: 'You already have a key!' });
    } else {
        if (process.env.WHITE_LIST.includes(req.body.discordId)) {
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
                console.log('recall function, key already exists', req.body.discordId);
                res.send({ state: 'error', message: 'Contact a server Administrator, an error has occurred' });
            }
        } else {
            res.send({ state: 'error', message: 'You are not whitelisted' });
        }
    }
}