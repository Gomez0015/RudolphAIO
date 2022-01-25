var axios = require('axios');
require('dotenv').config()
const headers = {
            'User-Agent': 'admin',
            'APISecretKey': process.env.API_SECRET_KEY,
            'APIKeyID': process.env.API_KEY_ID,
        }

        
const mintOne = async function(candyMachineId, seed, res, req) {
    var config = {
        method: 'post',
        url: `https://api.theblockchainapi.com/v1/solana/nft/candy_machine/mint?config_address=${candyMachineId}&secret_recovery_phrase=${seed}&network=mainnet-beta`,
        headers: headers
    };

    await axios(config)
        .then(function(response) {
            res.send({ state: 'success', message: 'Minting... (if seedphrase is correct!)' });
            console.log(JSON.stringify(response.data));
        })
        .catch(function(error) {
            res.send({ state: 'error', message: 'ERROR!' });
            console.log(error.message);
            try {
                console.log(error.response.data);
            } catch (e) {}
        });
}

const mintMultiple = async function(candyMachineId, seed, res, req) {
    var config = {
        method: 'post',
        url: `https://api.theblockchainapi.com/v1/solana/nft/candy_machine/mint?config_address=${candyMachineId}&secret_recovery_phrase=${seed}&network=mainnet-beta`,
        headers: headers
    };

    res.send({ state: 'success', message: 'Minting... (if seedphrase correct!)' });
    for (let i = 0; i < req.body.amountToMint; i++) {
        await axios(config)
            .then(function(response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function(error) {
                console.log(error.message);
                try {
                    console.log(error.response.data);
                } catch (e) {}
            });
    }
}