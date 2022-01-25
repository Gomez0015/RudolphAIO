const dashboardKeys = require('../models/dashboardKeysModel.js');

exports.checkAuthDiscord = async function(req, res) {

    const data = await dashboardKeys.findOne({ discordId: req.body.discordId });
    if (data) {
        if (req.body.discordLogin) {
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