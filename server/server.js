const express = require('express')
const bodyParser = require('body-parser');
const scraperController = require('./controllers/scraperController');
const mintController = require('./controllers/mintController');
const aiController = require('./controllers/aiController');
const userAuthController = require('./controllers/userAuthController');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require("path");
const db = mongoose.connection;
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const port = 3000

mongoose.connect('mongodb+srv://admin:' + process.env.MONGODB_PASSWORD + '@main.dyjqy.mongodb.net/rudolphAioDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

db.once("open", async function() {
    console.log("Database Connected successfully");
});


app.use(express.static(path.join(__dirname, "..", "build")));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin', 'https://gomez0015.github.io');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

    if ('OPTIONS' == req.method) return res.send(200);

    next();
});


app.get('/api/', (req, res) => {
    res.send('Hello World!');
})

app.get('/api/askRudolph', (req, res) => {
    aiController.getAnswer(res, req);
});

app.post('/api/startFarming', (req, res) => {
    aiController.startFarming(res, req);
});

app.post('/api/stopFarming', (req, res) => {
    aiController.stopFarming(res, req);
});

app.post('/api/getFarmingData', (req, res) => {
    aiController.getFarmingData(res, req);
});

app.post('/api/updateBotSettings', (req, res) => {
    aiController.updateBotSettings(res, req);
});

app.post('/api/mint', (req, res) => {
    scraperController.getScript(req.body.url, req.body.seed, res, req);
});

// DISCORD API
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const redirect = 'https://gomez0015.github.io/RudolphDashboardFront';

app.post('/api/getDiscordAuthInfo', async(req, res) => {
    const code = req.body.code;
    const oauthResult = await axios({
        method: 'POST',
        url: 'https://discord.com/api/oauth2/token',
        data: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirect,
            scope: 'identify',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).catch((err) => res.send({ state: 'error', message: 'Error getting user info' }));

    const oauthData = await oauthResult.data;

    const userResult = await axios({
        url: 'https://discord.com/api/users/@me',
        method: 'GET',
        headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
    }).catch((err) => res.send({ state: 'error', message: 'Error getting user info' }));

    const result = await userResult.data;

    if (result.code != 0) {
        res.send(result);
    } else {
        res.send({ state: 'error', message: 'Error getting user info' });
    }
});

app.get('/api/discordLogin', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});

app.post('/api/checkAuthDiscord', (req, res) => {
    userAuthController.checkAuthDiscord(res, req);
});

app.post('/api/linkKeyDiscord', (req, res) => {
    userAuthController.linkKeyDiscord(res, req);
});

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    console.error(err.stack);
});

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
});