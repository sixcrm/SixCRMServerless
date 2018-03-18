'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

class LeadNotification extends BaseNotification {

  constructor(){

    super();

    this.title = 'You\'ve got a new lead!';
    this.body = '{{campaign.name}} has a new lead!';
    this.category = 'transaction';

    this.account_wide = true;

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
