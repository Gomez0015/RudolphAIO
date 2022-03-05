var axios = require('axios');
require('dotenv').config();
const network = 'mainnet-beta';
let mintData = new Map();

exports.getMintData = async function(req, res) {


    if (mintData.has(req.body.userToken)) {

        let userMintData = mintData.get(req.body.userToken);

        for (let i = 0; i < userMintData.length; i++) {
            if (userMintData[i].status === 'success' || userMintData[i].status === 'failed') { return; }
            await axios({
                    method: 'get',
                    url: `https://api.blockchainapi.com/v1/solana/transaction/${network}/${userMintData[i].transaction_signature}`,
                    headers: {
                        'APISecretKey': process.env.API_SECRET_KEY,
                        'APIKeyID': process.env.API_KEY_ID,
                    }
                })
                .then(function(response) {
                    if (response.data.result.meta.status._err) {
                        userMintData[i].status = 'error';
                    } else if (response.result.meta.status._ok) {
                        userMintData[i].status = 'success';
                    } else {
                        userMintData[i].status = 'processing';
                    }
                }).catch(err => console.log(err.message));
        }

        mintData.set(req.body.userToken, userMintData);
        res.send({ mintData: userMintData });
    } else {
        res.send({ state: 'error', message: 'no data for user' });
    }
}

async function getCandyVersion(candyId, _callback) {

    await axios({
            method: 'get',
            url: `https://api.blockchainapi.com/v1/solana/account/${network}/${candyId}/is_candy_machine`,
            headers: {
                'APISecretKey': process.env.API_SECRET_KEY,
                'APIKeyID': process.env.API_KEY_ID,
            }
        })
        .then(function(response) {
            _callback(response.data);
        })
        .catch(function(error) {
            console.log(error);
            return undefined;
        });
}

async function getCandyMetadata(candyId, candyVersion, _callback) {
    await axios({
            method: 'post',
            url: `https://api.blockchainapi.com/v1/solana/nft/candy_machine/metadata`,
            data: {
                candy_machine_id: candyId,
                network: network,
                candy_machine_contract_version: candyVersion
            },
            headers: {
                'APISecretKey': process.env.API_SECRET_KEY,
                'APIKeyID': process.env.API_KEY_ID,
            }
        })
        .then(function(response) {
            _callback(response.data);
        })
        .catch(function(error) {
            console.log(error);
            return undefined;
        });
}


exports.mintOne = async function(candyId, privateKey, res, req) {
    candyId = candyId.trim();

    const discordId = req.body.userToken;

    if (discordId == undefined) { res.send({ state: 'error', message: 'Error with user Login' }); return; }

    let candyVersion = undefined;

    await getCandyVersion(candyId, async function(response) {
        candyVersion = response.candy_machine_contract_version;
    });

    if (candyVersion == undefined) { res.send({ state: 'error', message: 'Didnt find candy version' }); return; }

    let candyConfig = undefined;

    await getCandyMetadata(candyId, candyVersion, async function(response) {
        candyConfig = response.config_address;
        supplyLeft = (response.items_available - response.items_redeemed)
    });

    if (supplyLeft <= 0) { res.send({ state: 'error', message: 'No supply left' }); return; }
    if (candyConfig == undefined) { res.send({ state: 'error', message: 'Error getting metadata' }); return; }

    var config = {
        method: 'post',
        url: `https://api.theblockchainapi.com/v1/solana/nft/candy_machine/mint`,
        data: {
            config_address: candyConfig,
            wallet: {
                b58_private_key: privateKey
            },
            network: network,
            candy_machine_contract_version: candyVersion
        },
        headers: {
            'APISecretKey': process.env.API_SECRET_KEY,
            'APIKeyID': process.env.API_KEY_ID,
        }
    };

    await axios(config)
        .then(function(response) {
            res.send({ state: 'success', message: 'Minting...' });
            if (mintData.has(discordId)) {
                let tempArray = mintData.get(discordId);

                response.data.candyId = candyId;

                tempArray.push(response.data);

                mintData.set(discordId, tempArray);
            } else {
                response.data.candyId = candyId;
                mintData.set(discordId, [response.data]);
            }
        })
        .catch(function(error) {
            res.send({ state: 'error', message: error.message });
            console.log(error.message);
            try {
                console.log(error.response.data);
            } catch (e) {}
        });
}

exports.mintMultiple = async function(candyId, privateKey, res, req) {
    candyId = candyId.trim();

    const discordId = req.body.userToken;

    if (discordId == undefined) { res.send({ state: 'error', message: 'Error with user Login' }); return; }

    let candyVersion = undefined;

    await getCandyVersion(candyId, async function(response) {
        candyVersion = response.candy_machine_contract_version;
    });

    if (candyVersion == undefined) { res.send({ state: 'error', message: 'Didnt find candy version' }); return; }

    let candyConfig = undefined;

    await getCandyMetadata(candyId, candyVersion, async function(response) {
        candyConfig = response.config_address;
    });

    if (candyConfig == undefined) { res.send({ state: 'error', message: 'Error getting metadata' }); return; }

    var config = {
        method: 'post',
        url: `https://api.theblockchainapi.com/v1/solana/nft/candy_machine/mint`,
        data: {
            config_address: candyConfig,
            wallet: {
                b58_private_key: privateKey
            },
            network: network,
            candy_machine_contract_version: candyVersion
        },
        headers: {
            'APISecretKey': process.env.API_SECRET_KEY,
            'APIKeyID': process.env.API_KEY_ID,
        }
    };

    res.send({ state: 'success', message: 'Minting...' });
    for (let i = 0; i < req.body.amountToMint; i++) {
        await axios(config)
            .then(function(response) {
                if (mintData.has(discordId)) {
                    let tempArray = mintData.get(discordId);

                    response.data.candyId = candyId;

                    tempArray.push(response.data);

                    mintData.set(discordId, tempArray);
                } else {
                    response.data.candyId = candyId;
                    mintData.set(discordId, [response.data]);
                }
            })
            .catch(function(error) {
                console.log(error.message);
                try {
                    console.log(error.response.data);
                } catch (e) {}
            });
    }
}