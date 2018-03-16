'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

class LeadNotification extends BaseNotification {

  constructor(){

    super();

    this.title = 'You\'ve got a new lead!';
    this.body = '{{campaign.name}} has a new lead!';
    this.category = 'transaction';
    this.notification_type = 'lead';

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
      entity: 'customer',
      id: this.contextHelperController.getFromContext(context, 'customer.id', 'id')
    });

  }

}

module.exports = new LeadNotification();
