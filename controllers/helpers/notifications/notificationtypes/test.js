'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class TestNotification extends BaseNotification{

  constructor(){

    super();

    this.title = 'Test Notification';
    this.body = 'This is a test notification.';
    this.category = 'general';
    this.type = 'test';

  }

}

module.exports = new TestNotification();
