'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var levelFarmSchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        default: new Date()
    },
    endTimer: {
        type: Number,
        required: true
    },
    messages: {
        type: Array,
        default: []
    },
    botName: {
        type: String,
        required: true
    },
    botAvatar: {
        type: String
    },
    botToken: {
        type: Object,
        required: true
    },
    messageDelay: {
        type: Number,
        required: true
    },
    collectionName: {
        type: String,
        required: true
    },
    mintDate: {
        type: String,
        required: true
    },
    state: {
        type: Number,
        required: true
    },
    customPrompt: {
        type: String,
        required: false,
        default: ''
    },
    spam: {
        type: Boolean,
        required: true
    },
    delete: {
        type: Boolean,
        required: true
    },
    instantDelete: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('LevelFarms', levelFarmSchema);