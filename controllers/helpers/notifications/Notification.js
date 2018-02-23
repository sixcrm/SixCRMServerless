'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class NotificationHelperClass {

  constructor(){

  }

  executeNotifications(event_type, context){

    du.debug('Execute Notifications');

    du.info(event_type, context);

    return true;

  }

}
