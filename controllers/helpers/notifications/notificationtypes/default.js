'use strict'

//const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class DefaultNotification extends BaseNotification{

  constructor(){

    super();

    this.title = 'Default Notification';
    this.body = 'This is a default notification.';
    this.category = 'general';
    this.type = 'default';

  }

}

module.exports = new DefaultNotification();
