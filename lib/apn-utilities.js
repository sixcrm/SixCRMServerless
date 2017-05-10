'use strict'

const apn = require('apn');
const _ = require('underscore');
const du = require('./debug-utilities.js');

class APNUtilities {
    constructor() {
        this.provider = new apn.Provider(
            {
                token: {
                    key: "./../apn/APNsAuthKey_GZZ72HPHYT.p8",
                    keyId: "GZZ72HPHYT",
                    teamId: "3F67QV6VDK"
                },
                production: false
            }
        );
    }

    sendNotification(deviceToken, message) {
        let notification = new apn.Notification();

        notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600;
        notification.badge = 2;
        notification.sound = "ping.aiff";
        notification.alert = message;
        notification.payload = {};
        notification.topic = "com.clausruete.APNTest";

        this.provider.send(notification, deviceToken).then(
            result => {
                du.output(result);
            }
        );
    }
}

module.exports = new APNUtilities();