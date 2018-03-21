'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class DefaultNotification extends BaseNotification{

  constructor(){

    super();

    this.name = 'default';

  }

}

module.exports = new DefaultNotification();
