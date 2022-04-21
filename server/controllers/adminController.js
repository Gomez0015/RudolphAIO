const serverData = require('../server.js');
const dashboardKeys = require('../models/dashboardKeysModel');
const levelFarms = require('../models/levelFarmModel');

exports.getAdminData = async function(req, res) {
    const data = await levelFarms.find({});
    if (data) {
        res.send(data);
    } else {
        res.send([]);
    }
}

const mostFrequent = arr =>
    Object.entries(
        arr.reduce((a, v) => {
            a[v] = a[v] ? a[v] + 1 : 1;
            return a;
        }, {})
    ).reduce((a, v) => (v[1] >= a[1] ? v : a), [null, 0])[0];


exports.getStats = async function(req, res) {
    let stats = {
        totalMonitors: 0,
        totalBots: 0,
        totalBotsFarming: 0,
        topCollection: 'none',
    }

    const farmData = await levelFarms.find({});
    const userData = await dashboardKeys.find({});

    let allCollections = [];

    // User Data Loop
    for (let index = 0; index < userData.length; index++) {
        stats.totalMonitors += (userData[index].monitors.wallets.length + userData[index].monitors.collections.length);
    }

    // Farm Data Loop
    for (let index = 0; index < farmData.length; index++) {
        stats.totalBots += 1;
        if (farmData[index].state == 1) stats.totalBotsFarming += 1;
        if (farmData[index].collectionName != 'none') allCollections.push(farmData[index].collectionName);
    }

    if (allCollections.length > 0) stats.topCollection = mostFrequent(allCollections);

    if (stats) {
        res.send(stats);
    } else {
        res.send({
            totalMonitors: 0,
            totalBots: 0,
            totalBotsFarming: 0,
            topCollection: 'none',
        });
    }
}