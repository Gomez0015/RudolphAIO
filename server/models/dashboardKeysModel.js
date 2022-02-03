'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dashboardKeysSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        default: new Date()
    },
    discordId: {
        type: String,
        default: 'none'
    },
    expired: {
        type: Boolean,
        default: false
    },
    lastLoginIp: {
        type: String,
        default: 'none'
    },
    chatLogs: {
        type: Array,
        default: [],
    }
});

module.exports = mongoose.model('DashboardKeys', dashboardKeysSchema);