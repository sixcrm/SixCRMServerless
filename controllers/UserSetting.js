'use strict';
const entityController = require('./Entity.js');

class userSettingController extends entityController {

    constructor() {
        super(process.env.user_settings_table, 'usersetting');
        this.table_name = process.env.user_settings_table;
        this.descriptive_name = 'usersetting';
    }

}

module.exports = new userSettingController();
