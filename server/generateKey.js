const mongoose = require('mongoose');
const db = mongoose.connection;
const dashboardKeys = require('./models/dashboardKeysModel.js');
const dotenv = require('dotenv')
dotenv.config()

mongoose.connect('mongodb+srv://admin:' + process.env.MONGODB_PASSWORD + '@main.dyjqy.mongodb.net/rudolphAioDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

let keysToGenerate = 1;

db.once("open", async function() {
    console.log("Database Connected successfully");
    for (let i = 0; i < keysToGenerate; i++) {
        console.log('generating key #' + (i + 1));
        let generatedKey = await genKey(29);
        console.log(generatedKey.toUpperCase());
        await dashboardKeys.create({ key: generatedKey.toUpperCase(), discordId: 'none', expired: 'false', start_date: new Date() });
        console.log('finished key #' + (i + 1));
    }
});

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