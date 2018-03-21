'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class TestAlertNotification extends BaseNotification {

  constructor(){

    super();

    this.name = 'test_alert';
    this.notification_type = 'alert';

  }

}

module.exports = new TestAlertNotification();
