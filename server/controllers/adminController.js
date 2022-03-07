const serverData = require('../server.js');

exports.getAdminData = async function(req, res) {
    const data = serverData.allFarmData;
    if (data) {
        res.send(data);
    } else {
        res.send([]);
    }
}