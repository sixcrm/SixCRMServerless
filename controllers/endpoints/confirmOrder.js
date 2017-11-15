'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');

class ConfirmOrderController extends transactionEndpointController{

  constructor(){
    super({
      required_permissions: [
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
        'product/read',
        'affiliate/read',
        'transaction/read',
        'rebill/read',
        'notifications/create',
        'tracker/read'
      ],
      notification_parameters: {
        type: 'session',
        action: 'closed',
        title: 'Completed Session',
        body: 'A customer has completed a session.'
      }
    });

    this.parameter_definitions = {
      execute: {
        required : {
          event:'event'
        }
      }
    };

    this.parameter_validation = {
      'event':global.SixCRM.routes.path('model', 'endpoints/confirmOrder/event.json'),
      'session':global.SixCRM.routes.path('model', 'entities/session.json'),
      'customer':global.SixCRM.routes.path('model', 'entities/customer.json'),
      'campaign': global.SixCRM.routes.path('model', 'entities/campaign.json'),
      'products':global.SixCRM.routes.path('model', 'endpoints/components/transactionproducts.json'),
      'transactions':global.SixCRM.routes.path('model', 'endpoints/components/transactions.json'),
      'response':global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json')
    };

    this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');

    this.initialize();

  }

  execute(event){

    return this.preprocessing(event)
    .then((event) => this.acquireQuerystring(event))
    .then((event) => {

      this.parameters.setParameters({argumentation:{event: event}, action: 'execute'});

    })
    .then(() => this.hydrateSession())
    .then(() => this.validateSession())
    .then(() => this.hydrateSessionProperties())
    .then(() => this.confirmOrder())
    .then(() => this.buildResponse())
    .then(result_object => {

      this.postProcessing();

      return this.parameters.get('response');

    });

  }

  hydrateSession(){

    du.debug('Hydrate Session');

    let event = this.parameters.get('event');

    return this.sessionController.get({id: event.session}).then(session => {

      this.parameters.set('session', session);
      return true;

    });

  }

  validateSession(){

    du.debug('Validate Session');

    let session = this.parameters.get('session');

    if(session.completed == true){
      eu.throwError('bad_request', 'The specified session is already complete.');
    }

    return Promise.resolve(true);

  }

  hydrateSessionProperties(){

    du.debug('Hydrate Session Properties');

    let session = this.parameters.get('session');

    let promises = [
      this.sessionController.getCustomer(session),
      this.sessionController.listTransactions(session),
      this.sessionController.listProducts(session)
    ];

    return Promise.all(promises).then(promises => {

      this.parameters.set('customer', promises[0]);
      this.parameters.set('transactions', promises[1]);
      this.parameters.set('products', promises[2]);

      return true;

    });

  }

  confirmOrder(){

    du.debug('Confirm Order');

    let session = this.parameters.get('session');

    return this.sessionController.closeSession(session).then(() => {

      return true;

    });

  }

  buildResponse(){

    du.debug('Build Response');

    let session = this.parameters.get('session');
    let customer = this.parameters.get('customer');
    let transactions = this.parameters.get('transactions');
    let products = this.parameters.get('products');

    this.parameters.set('response', {
      session:session,
      customer: customer,
      transactions: transactions,
      transaction_products: products
    });

    return Promise.resolve(true);

  }

  postProcessing(){

    du.debug('Post Processing');

    let promises = [
      this.pushToRedshift()
      //this.handleNotifications();
    ];

    return Promise.all(promises).then(promises => {

      return true;

    });

  }

  pushToRedshift(results){

    du.debug('Push To Redshift');

    let session = this.parameters.get('session');

    return this.pushEventToRedshift('confirm', session).then((result) => {

      return true;

    });

  }

}

module.exports = new ConfirmOrderController();
