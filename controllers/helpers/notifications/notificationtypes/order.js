'use strict'
const _ = require('underscore');
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

  getTitle(context){

    du.debug('Get Title');

    let parsed_title = super.getTitle(context);

    if(_.has(context, 'transactionsubtype')){
      parsed_title = parsed_title.replace('!', '')+' ('+context.transactionsubtype+')!';
    }

    return parsed_title;

  }

  getBody(context){

    du.debug('Get Body');

    let parsed_body = super.getBody(context);

    if(_.has(context, 'transactionsubtype')){
      parsed_body = parsed_body.replace('!', '')+' ('+context.transactionsubtype+')!';
    }

    return parsed_body;

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
