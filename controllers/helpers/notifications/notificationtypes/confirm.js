'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

class ConfirmNotification extends BaseNotification {

  constructor(){

    super();

    this.name = 'confirm';
    this.context_required = ['campaign.name', 'session.id'];
    this.category = 'transaction';

    this.account_wide = true;

  }

}

module.exports = new ConfirmNotification();