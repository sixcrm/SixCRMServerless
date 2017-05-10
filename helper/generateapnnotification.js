'use strict'

const apnutilities = require('../lib/apn-utilities');
const du = require('../lib/debug-utilities.js');

let deviceToken = process.argv[2];

let message = process.argv[3];

if(
    deviceToken == undefined
    || deviceToken == ''
    || message == undefined
    || message == ''
) {
    du.output('Usage: node generateapnnotification.js [device token] [message]');
} else {
    apnutilities.sendNotification(deviceToken, message)
}
