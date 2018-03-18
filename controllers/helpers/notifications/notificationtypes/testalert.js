'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class TestAlert extends BaseNotification {

  constructor(){

    super();

    this.title = 'Test Alert';
    this.body = 'This is a test alert.';
    this.category = 'general';
    this.notification_type = 'alert';

  }

}

module.exports = new TestAlert();
