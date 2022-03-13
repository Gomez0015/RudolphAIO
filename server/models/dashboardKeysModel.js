'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dashboardKeysSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    start_date: {
        type: Date,
        default: new Date()
    },
    discordId: {
        type: String,
        default: 'none',
        unique: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    lastLoginIp: {
        type: String,
        default: 'none'
    },
    authToken: {
        type: String,
        default: 'none'
    },
    chatLogs: {
        type: Array,
        default: [],
    },
    monitors: {
        type: Object,
        default: {
            wallets: [],
            collections: [],
        },
    }
});

module.exports = mongoose.model('DashboardKeys', dashboardKeysSchema);