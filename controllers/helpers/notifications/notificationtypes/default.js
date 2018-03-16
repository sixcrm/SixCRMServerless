'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class DefaultNotification extends BaseNotification{

  constructor(){

    super();

    this.title = 'Default Notification';
    this.body = 'This is a default notification.';
    this.category = 'general';

  }

}

module.exports = new DefaultNotification();
