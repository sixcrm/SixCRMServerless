'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

class OrderNotification extends BaseNotification {

  constructor(){

    super();

    this.title = 'You\'ve got a new order!';
    this.body = '{{campaign.name}} has a new order!';
    this.category = 'transaction';

    this.account_wide = true;

  }

  transformContext(context){

    du.debug('Transform Context');

    let return_object = {
      user: this.getUserFromContext(context),
      account: this.getAccountFromContext(context),
      type: this.getNotificationType(),
      category: this.getNotificationCategory(),
      title: this.getTitle(context),
      body: this.getBody(context),
      action: this.createAction(context)
    };


    return return_object;

  }

  createAction(context){

    du.debug('Create Action');

    return JSON.stringify({
      entity: 'session',
      id: this.contextHelperController.getFromContext(context, 'session.id', 'id')
    });

  }

}

module.exports = new OrderNotification();
