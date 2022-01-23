const levelFarms = require('../models/levelFarmModel');

exports.getAdminData = async function(candyConfig, seed, res, req) {
    const data = await levelFarms.find({});
    if (data) {
        res.send(data);
    } else {
        res.send([]);
    }
}