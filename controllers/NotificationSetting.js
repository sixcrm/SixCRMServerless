'use strict';
const _ = require('underscore');

const du = require('../lib/debug-utilities.js');

const entityController = require('./Entity.js');

class notificationSettingController extends entityController {

    constructor() {
        super(process.env.notifications_table, 'notificationsetting');
        this.table_name = process.env.notification_settings_table;
        this.descriptive_name = 'notificationsetting';
    }

}

module.exports = new notificationSettingController();
