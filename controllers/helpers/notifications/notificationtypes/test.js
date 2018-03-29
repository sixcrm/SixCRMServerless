'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class TestNotification extends BaseNotification {

  constructor(){

    super();

    this.category = 'test';
    this.name = 'test';

  }

}

module.exports = new TestNotification();
