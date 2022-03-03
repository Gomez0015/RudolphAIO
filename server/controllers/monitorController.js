const dashboardKeys = require('../models/dashboardKeysModel');

exports.addMonitor = async function(req, res) {
    const type = req.body.type;
    const data = req.body.data;

    const userData = await dashboardKeys.findOne({ discordId: req.body.userToken });

    if (type) {
        if ((userData.monitors.wallets.length + userData.monitors.collections.length) > 20) {
            res.send({ state: 'error', message: 'Reached max amount of 20 monitors' })
        } else {
            switch (type) {
                case 'collection':
                    await userData.monitors.collections.push({ data: data, lastSent: 'none', floorLow: req.body.floorLow, floorHigh: req.body.floorHigh, id: Math.floor(Math.random() * 1000000000) });
                    await dashboardKeys.updateOne({ discordId: req.body.userToken }, userData);
                    res.send({ state: 'success', message: 'Collection Monitor Created' });
                    break;
                case 'wallet':
                    await userData.monitors.wallets.push({ data: data, lastSent: [], id: Math.floor(Math.random() * 1000000000) });
                    await dashboardKeys.updateOne({ discordId: req.body.userToken }, userData);
                    res.send({ state: 'success', message: 'Wallet Monitor Created' });
                    break;
                default:
                    res.send({ state: 'error', message: 'Invalid type' });
                    break;
            }
        }
    } else {
        res.send({ state: 'error', message: 'No type provided' })
    }
}

exports.deleteMonitor = async function(req, res) {
    const type = req.body.type;
    const data = req.body.data;

    const userData = await dashboardKeys.findOne({ discordId: req.body.userToken });

    if (type) {
        switch (type) {
            case 'collection':
                await userData.monitors.collections.splice(userData.monitors.collections.indexOf(data), 1);
                await dashboardKeys.updateOne({ discordId: req.body.userToken }, userData);
                res.send({ state: 'success', message: 'Collection Monitor Deleted' });
                break;
            case 'wallet':
                await userData.monitors.wallets.splice(userData.monitors.wallets.indexOf(data), 1);
                await dashboardKeys.updateOne({ discordId: req.body.userToken }, userData);
                res.send({ state: 'success', message: 'Wallet Monitor Deleted' });
                break;
            default:
                res.send({ state: 'error', message: 'Invalid type' });
                break;
        }
    } else {
        res.send({ state: 'error', message: 'No type provided' })
    }
}

exports.getMonitors = async function(req, res) {

    const userData = await dashboardKeys.findOne({ discordId: req.body.userToken });

    if (userData) {
        if (userData.authToken == req.body.authToken) {
            res.send({ monitors: userData.monitors });
        } else {
            res.send({ state: 'error', message: 'Wrong Auth Token! (stop trying to hax us)' })
        }
    } else {
        res.send({ state: 'error', message: 'Couldnt find user!' })
    }
}

exports.updateMonitor = async function(req, res) {

    const userData = await dashboardKeys.findOne({ discordId: req.body.userToken });

    function findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }

    if (userData) {
        switch (req.body.type) {
            case 'collection':

                userData.monitors.collections[findWithAttr(userData.monitors.collections, 'id', req.body.old.data.id)].type = req.body.type;
                userData.monitors.collections[findWithAttr(userData.monitors.collections, 'id', req.body.old.data.id)].data = req.body.data;
                userData.monitors.collections[findWithAttr(userData.monitors.collections, 'id', req.body.old.data.id)].floorLow = req.body.floorLow;
                userData.monitors.collections[findWithAttr(userData.monitors.collections, 'id', req.body.old.data.id)].floorHigh = req.body.floorHigh;


                await dashboardKeys.updateOne({ discordId: req.body.userToken }, userData);
                res.send({ state: 'success', message: 'Collection Monitor Deleted' });
                break;
            case 'wallet':
                userData.monitors.wallets[findWithAttr(userData.monitors.wallets, 'id', req.body.old.data.id)].type = req.body.type;
                userData.monitors.wallets[findWithAttr(userData.monitors.wallets, 'id', req.body.old.data.id)].data = req.body.data;
                userData.monitors.wallets[findWithAttr(userData.monitors.wallets, 'id', req.body.old.data.id)].floorLow = req.body.floorLow;
                userData.monitors.wallets[findWithAttr(userData.monitors.wallets, 'id', req.body.old.data.id)].floorHigh = req.body.floorHigh;

                await dashboardKeys.updateOne({ discordId: req.body.userToken }, userData);
                res.send({ state: 'success', message: 'Wallet Monitor Deleted' });
                break;
            default:
                res.send({ state: 'error', message: 'Invalid type' });
                break;
        }
    } else {
        res.send({ state: 'error', message: 'Couldnt find User!' });
    }
}