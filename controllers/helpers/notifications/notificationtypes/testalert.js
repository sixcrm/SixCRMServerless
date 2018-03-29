'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class TestAlertNotification extends BaseNotification {

  constructor(){

    super();

    this.name = 'testalert';
    this.notification_type = 'alert';
    this.category = 'test';

  }

}

module.exports = new TestAlertNotification();
