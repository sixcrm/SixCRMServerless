'use strict'

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

class ConfirmNotification extends BaseNotification {

  constructor(){

    super();

    this.title = 'A customer has just confirmed thier order.';
    this.body = '{{campaign.name}} has a new confirmed order!';
    this.category = 'transaction';

    this.account_wide = true;

  }

  createAction(context){

    du.debug('Create Action');

    return JSON.stringify({
      entity: 'session',
      id: this.contextHelperController.getFromContext(context, 'session.id', 'id')
    });

  }

}

module.exports = new ConfirmNotification();
