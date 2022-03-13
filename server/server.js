const express = require('express')
const bodyParser = require('body-parser');
const scraperController = require('./controllers/scraperController');
const mintController = require('./controllers/mintController');
const aiController = require('./controllers/aiController');
const userAuthController = require('./controllers/userAuthController');
const adminController = require('./controllers/adminController');
const botController = require('./controllers/botController');
const monitorController = require('./controllers/monitorController');
const levelFarms = require('./models/levelFarmModel');
const dashboardKeys = require('./models/dashboardKeysModel');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const path = require("path");
const helmet = require("helmet");
const db = mongoose.connection;
const dotenv = require('dotenv');
dotenv.config()

const app = express()
const port = 3000

mongoose.connect('mongodb+srv://admin:' + process.env.MONGODB_PASSWORD + '@main.dyjqy.mongodb.net/rudolphAioDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

let allFarmData = [];
async function getAllFarms() {
    allFarmData = await levelFarms.find({});
    exports.allFarmData = allFarmData;
}

exports.updateFarmData = async function(allFarmData) {
    exports.allFarmData = allFarmData;
}

exports.allFarmData = allFarmData;

db.once("open", async function() {
    console.log("Database Connected successfully");
    getAllFarms();
});

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data: https:"],
            "default-src": ["'self'", "https://api-mainnet.magiceden.dev/", "https://api.mainnet-beta.solana.com/", "wss://api.mainnet-beta.solana.com/", "https://api.opensea.io/", "https://lh3.googleusercontent.com/", "https://discordapp.com/", "http://2captcha.com/"]
        }
    }
}));

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('trust proxy', true);

function myMiddleware(req, res, next) {
    Object.keys(req.body).map(k => {
        req.body[k] = typeof req.body[k] == 'string' ? req.body[k].trim() : req.body[k]
    });

    next()
}

app.use(myMiddleware)

let magicCalendar = [];
let howRareCalendar = [];

axios.get('https://api-mainnet.magiceden.dev/v2/launchpad/collections?offset=0&limit=200').then(response => {
    magicCalendar = response.data;
});

const cron = require('node-cron');

cron.schedule('0 1 * * *', () => {
    axios.get('https://api-mainnet.magiceden.dev/v2/launchpad/collections?offset=0&limit=200').then(response => {
        response.data.sort(function(a, b) {
            return new Date(b.launchDatetime) - new Date(a.launchDatetime);
        });

        magicCalendar = response.data;
    });
});

app.get('/api/getCalendarData', (req, res) => {
    res.send(magicCalendar);
});


app.get('/', (req, res) => {
    res.send('Spooky, Scary Skeletons Shivering Down Your Spine!');
});


app.get('/api/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/askRudolph', (req, res) => {
    aiController.getAnswer(res, req);
});

app.post('/api/createBot', (req, res) => {
    botController.createBot(req, res);
});

app.post('/api/startFarming', (req, res) => {
    aiController.startFarming(res, req);
});

app.post('/api/stopFarming', (req, res) => {
    aiController.stopFarming(res, req);
});

app.post('/api/getMonitors', (req, res) => {
    monitorController.getMonitors(req, res);
});

app.post('/api/addMonitor', (req, res) => {
    monitorController.addMonitor(req, res);
});

app.post('/api/updateMonitor', (req, res) => {
    monitorController.updateMonitor(req, res);
});

app.post('/api/deleteMonitor', (req, res) => {
    monitorController.deleteMonitor(req, res);
});

app.post('/api/getBots', (req, res) => {
    botController.getBots(res, req);
});

app.post('/api/updateBotSettings', (req, res) => {
    botController.updateBotSettings(res, req);
});

app.post('/api/deleteBot', (req, res) => {
    botController.deleteBot(res, req);
});

app.post('/api/solveCaptcha', (req, res) => {
    botController.solveCaptcha(res, req);
});


app.post('/api/mintUrl', (req, res) => {
    scraperController.getScript(req.body.url, req.body.privateKey, res, req);
});

app.post('/api/mintId', (req, res) => {
    if (req.body.amountToMint > 1) {
        mintController.mintMultiple(req.body.candyId, req.body.privateKey, res, req);
    } else {
        mintController.mintOne(req.body.candyId, req.body.privateKey, res, req);
    }
});

app.post('/api/getMintData', (req, res) => {
    mintController.getMintData(req, res);
});


app.post('/api/getAdminData', (req, res) => {
    adminController.getAdminData(req, res);
});

// DISCORD API
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const redirect = process.env.SERVER_URI + '/dashboard';

app.post('/api/getDiscordAuthInfo', async(req, res) => {
    const code = req.body.code;

    await axios({
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
    }).then(async(response) => {
        let oauthData = response.data;
        if (!oauthData) { res.send({ state: 'error', message: 'Error getting user info' }) } else {
            const userResult = await axios({
                url: 'https://discord.com/api/users/@me',
                method: 'GET',
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            }).catch((err) => res.send({ state: 'error', message: 'Error getting user info' }));

            const result = await userResult.data;

            if (result.code != 0) {
                let generatedAuthToken = uuidv4();
                await dashboardKeys.updateOne({ discordId: result.id }, { authToken: generatedAuthToken });
                result.authToken = generatedAuthToken;

                res.send(result);
            } else {
                res.send({ state: 'error', message: 'Error getting user info' });
            }
        }
    }).catch((err) => {
        console.log(err.message, 1);
        res.send({ state: 'error', message: 'Error getting user info' })
    });
});

app.get('/api/discordLogin', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});

app.post('/api/checkAuthDiscord', (req, res) => {
    userAuthController.checkAuthDiscord(req, res);
});

app.post('/api/linkKeyDiscord', (req, res) => {
    userAuthController.linkKeyDiscord(res, req);
});

app.post('/api/checkKeyAvailability', (req, res) => {
    userAuthController.checkKeyAvailability(req, res);
});


app.post('/api/generateNewKey', (req, res) => {
    userAuthController.generateNewKey(req, res);
});

app.get('/api/getStats', (req, res) => {
    adminController.getStats(req, res);
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.get('/dashboard/*', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

if (process.env.NODE_ENV === 'production') {
    process.stdin.resume(); //so the program will not close instantly

    async function exitHandler(options, exitCode) {
        if (options.cleanup) console.log('clean');
        if (exitCode || exitCode === 0) console.log(exitCode);
        if (options.exit) {
            await aiController.saveFarmData();
            process.exit();
        }
    }

    //do something when app is closing
    process.on('exit', exitHandler.bind(null, { cleanup: true }));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
    process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

    process.on('uncaughtException', function(err) {
        console.log('Caught exception: ' + err);
        console.error(err.stack);
    });
}

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
});