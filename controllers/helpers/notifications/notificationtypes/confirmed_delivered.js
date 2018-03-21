'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class ConfirmedDeliveredNotification extends BaseNotification {

  constructor(){

    super();

    this.name = 'confirm_delivered';
    this.category = 'fulfillment';
    this.context_required = ['rebill.id'];
    this.account_wide = true;

  }

}

module.exports = new ConfirmedDeliveredNotification();
