'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
//Technical Debt:  The create method must assure a user/account
class notificationSettingController extends entityController {

    constructor() {
        super('notificationsetting');
    }

    getDefaultProfile(){

      return Promise.resolve(global.SixCRM.routes.include('model', 'general/default_notification_settings.json'));

    }

}

module.exports = new notificationSettingController();
