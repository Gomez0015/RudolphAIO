const levelFarms = require('../models/levelFarmModel');

exports.getAdminData = async function(req, res) {
    const data = await levelFarms.find({});
    if (data) {
        res.send(data);
    } else {
        res.send([]);
    }
}