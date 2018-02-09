'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

class checkoutController extends transactionEndpointController{

  constructor(){

    super();

    this.required_permissions = [
      'user/read',
      'account/read',
      'session/create',
      'session/read',
      'session/update',
      'campaign/read',
      'creditcard/create',
      'creditcard/update',
      'creditcard/read',
      'productschedule/read',
      'loadbalancer/read',
      'loadbalancerassociation/read',
      'rebill/read',
      'rebill/create',
      'rebill/update',
      'product/read',
      'affiliate/read',
      'notification/create',
      'tracker/read'
    ];

    this.parameter_definitions = {
      execute: {
        required : {
          event:'event'
        }
      }
    };

    this.parameter_validation = {
      'event':global.SixCRM.routes.path('model', 'endpoints/checkout/event.json'),
      'session':global.SixCRM.routes.path('model', 'entities/session.json'),
      'order':global.SixCRM.routes.path('model', 'endpoints/checkout/order.json'),
      'confirmation':global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json')
    };

    this.createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
    this.createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
    this.confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

    this.initialize();

  }

  execute(event){

    du.debug('Execute');

    return this.preamble(event)
    .then(() => this.createLead())
    .then(() => this.setSession())
    .then(() => this.createOrder())
    .then(() => this.confirmOrder())
    .then(() => this.postProcessing());

  }

  setSession(){

    du.debug('Set Session');

    let session = this.parameters.get('session');

    let event = this.parameters.get('event');

    event.session = session.id;

    this.parameters.set('event', event);

    return Promise.resolve(true);

  }

  confirmOrder(){

    du.debug('Confirm Order');

    let event = this.parameters.get('event');

    this.confirmOrderController.parameters.set('event', event);

    return this.confirmOrderController.confirmOrder().then(result => {
      this.parameters.set('confirmation', result);
      return Promise.resolve(true);
    });

  }

  createOrder(){

    du.debug('Create Order');

    let event = this.parameters.get('event');

    this.createOrderController.parameters.set('event', event);

    return this.createOrderController.createOrder().then(result => {
      this.parameters.set('order', result);
      return Promise.resolve(true);
    });

  }

  createLead(){

    du.debug('Create Lead');

    let event = this.parameters.get('event');

    this.createLeadController.parameters.set('event', event);

    return this.createLeadController.createLead().then(result => {
      this.parameters.set('session', result);
      return Promise.resolve(true);
    });

  }

  postProcessing(){

    du.debug('Post Processing');

    let info = this.parameters.get('confirmation');

    return info;

  }

}

module.exports = new checkoutController();
