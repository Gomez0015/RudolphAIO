var file_pattern = /([0-9_.-]+)\.([a-zA-Z0-9_.-]+)\.chunk\.js/i
var wget = require('node-wget');
var cheerio = require('cheerio'),
    request = require('request');
const mintController = require('./mintController');

var possibleFuckers = ['CANDY_MACHINE_ID'];

const getInfo = async function(url, seed, res, req) {
    wget({
            url: url,
            dest: './controllers/tmp/data', // destination path or path with filenname, default is ./
            timeout: 2000 // duration to wait for request fulfillment in milliseconds, default is 2 seconds
        },
        function(error, response, body) {
            if (error) {
                console.log('--- error:');
                console.log(error); // error encountered
                res.send({ state: 'error', message: 'Error from Website' });
            } else {
                for (let i = 0; i < possibleFuckers.length; i++) {
                    try {
                        const candyConfig = body.split(possibleFuckers[i])[1].substring(0, 47).replace(':"', '').replace('"', '');
                        console.log(candyConfig, seed);

                        i = possibleFuckers.length;

                        if (req.body.amountToMint > 1) {
                            mintController.mintMultiple(candyConfig, seed, res, req);
                        } else {
                            mintController.mintOne(candyConfig, seed, res, req);
                        }
                    } catch (e) {
                        console.log('no work');
                        if (i === possibleFuckers.length - 1) {
                            res.send({ state: 'error', message: 'Error from Website' });
                        }
                    }
                }
            }
        }
    );
}

exports.getScript = async function(url, seed, res, req) {
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);

            var scriptSrcs = $('script').map(function(i) {
                return $(this).attr('src');
            }).get();

            console.log("script:");
            for (var i = 0; i < scriptSrcs.length; i++) {
                if (scriptSrcs[i].match(file_pattern)) {
                    console.log(scriptSrcs[i]);
                    getInfo(url + scriptSrcs[i], seed, res, req);
                }
            }
        } else {
            console.log('error');
            res.send({ state: 'error', message: 'Error in Url' });
        }
    });
}