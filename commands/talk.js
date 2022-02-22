// node-fetch for making HTTP requests
const fetch = require('node-fetch');
// my model URL
API_URL = 'https://api-inference.huggingface.co/models/HansAnonymous/DialoGPT-small-shrek';

let questionArray = [];
let responsesArray = [];

exports.run = async(bot, message, args) => {
    // form the payload
    const payload = {
        inputs: {
            past_user_inputs: questionArray,
            generated_responses: responsesArray,
            text: args.join(' '),
        }
    };
    // form the request headers with Hugging Face API key
    const headers = {
        'Authorization': 'Bearer ' + process.env.HUGGINGFACE_TOKEN
    };

    // query the server
    const response = await fetch(API_URL, {
        method: 'post',
        body: JSON.stringify(payload),
        headers: headers
    });
    const data = await response.json();
    let botResponse = '';
    if (data.hasOwnProperty('generated_text')) {
        botResponse = data.generated_text;
    } else if (data.hasOwnProperty('error')) { // error condition
        botResponse = data.error;
    }
    // send message to channel as a reply
    message.reply(botResponse);
    questionArray.push(args.join(' '));
    responsesArray.push(botResponse);
}

exports.info = {
    name: "talk",
    description: "Talk to Rudolph!"
}