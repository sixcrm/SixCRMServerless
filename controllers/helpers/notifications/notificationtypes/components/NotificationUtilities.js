'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');

module.exports = class NotificationUtilities {

  constructor(){

  }

  getNotificationCategory(){

    du.debug('Get Notification Category');

    if(_.has(this, 'category')){
      return this.category;
    }

    eu.throwError('server', 'Unable to determine notification category.');

  }

  getNotificationType(){

    du.debug('Get Notification Type');

    if(_.has(this, 'notification_type')){
      return this.notifcation_type;
    }

    eu.throwError('server', 'Unable to determine notification type.');

  }

}
