'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const modelvalidationutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');

class CreateOrderController extends transactionEndpointController{

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
        'rebill/read',
        'rebill/create',
        'rebill/update',
        'product/read',
        'affiliate/read',
        'notification/create',
        'tracker/read'
      ],
      notification_parameters: {
        type: 'order',
        action: 'added',
        title: 'A new order',
        body: 'A new order has been created.'
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
      'event':global.SixCRM.routes.path('model', 'endpoints/createOrder/event.json'),
      'session': global.SixCRM.routes.path('model', 'entities/session.json'),
      'creditcard':global.SixCRM.routes.path('model', 'entities/creditcard.json'),
      'campaign':global.SixCRM.routes.path('model', 'entities/campaign.json'),
      'customer':global.SixCRM.routes.path('model', 'entities/customer.json'),
      'productschedules':global.SixCRM.routes.path('model','endpoints/components/productschedules.json'),
      'rebill':global.SixCRM.routes.path('model', 'entities/rebill.json'),
      'transaction':global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'info':global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'),
      'result':global.SixCRM.routes.path('model', 'functional/register/transactionresult.json'),
      'processorresponse':global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
      'amount':global.SixCRM.routes.path('model', 'definitions/currency.json'),
    };

    this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
    this.creditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
    this.campaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
    this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

    this.initialize();

  }

  execute(event){

    du.debug('Execute');

    return this.preprocessing((event))
		.then((event) => this.acquireBody(event))
    .then((event_body) => {
      this.parameters.setParameters({argumentation:{event: event_body}, action: 'execute'});
    })
    .then(() => this.hydrateEventParameters())
    .then(() => this.hydrateEventAssociatedParameters())
    .then(() => this.validateEventProperties())
    .then(() => this.updateCustomer())
    .then(() => this.createRebill())
    .then(() => this.processRebill())
    .then(() => this.updateEntities())
    .then(() => this.buildInfoObject())
    .then(() => this.postProcessing())
    .then(() => {
      //Technical Debt:  We're going to want to prune this a bit...
      return this.parameters.get('info');

    });

  }


  hydrateEventParameters(event_body) {

    du.debug('Get Order Info');

    let event = this.parameters.get('event');

    this.parameters.set('productschedules', event.product_schedules);

    var promises = [
      this.sessionController.get({id: event.session}),
      this.creditCardController.assureCreditCard(event.creditcard)
    ];

    return Promise.all(promises).then((promises) => {

      this.parameters.set('session', promises[0]);
      this.parameters.set('creditcard', promises[1]);

      return true;

    });

  }

  hydrateEventAssociatedParameters(){

    du.debug('Hydrate Event Associated Parameters');

    let session = this.parameters.get('session');

    return this.campaignController.get({id: session.campaign}).then(campaign => {

      this.parameters.set('campaign', campaign);
      return true;

    });

  }

  validateEventProperties(){

    du.debug('Validate Event Properties');

    let session = this.parameters.get('session');
    let campaign = this.parameters.get('campaign');
    let product_schedules = this.parameters.get('productschedules');

    //Technical Debt: need to configure session length elsewhere
    if(session.created_at < timestamp.toISO8601(timestamp.createTimestampSeconds() - 3600)){
      eu.throwError('bad_request', 'Session has expired.');
    }

    if(session.completed == true){
      eu.throwError('bad_request', 'The session is already complete.');
    }

    arrayutilities.map(product_schedules, product_schedule => {
      if(!_.contains(campaign.productschedules, product_schedule)){
        eu.throwError('bad_request', 'The product schedule provided is not a part of the campaign.');
      }
    });

    return Promise.resolve(true);

  }

  updateCustomer(){

    du.debug('Update Customer');

    let session = this.parameters.get('session');
    let creditcard = this.parameters.get('creditcard');

    return this.customerController.addCreditCard(session.customer, creditcard).then((customer) => {

      this.parameters.set('customer', customer);

      return true;

    });

  }

  createRebill() {

    du.debug('Create Rebill');

    let rebillHelper = new RebillHelperController();

    let session = this.parameters.get('session');
    let product_schedules = this.parameters.get('productschedules');

    return rebillHelper.createRebill({session: session, product_schedules: product_schedules, day: -1})
    .then(rebill => {

      this.parameters.set('rebill', rebill);
      return true;

    });

  }

  processRebill(){

    du.debug('Process Rebill');

    let registerController = new RegisterController();
    let rebill = this.parameters.get('rebill');

    return registerController.processTransaction({rebill: rebill}).then((register_response) =>{

      this.parameters.set('transaction', register_response.parameters.get('transaction'));
      this.parameters.set('result', register_response.getProcessorResponse().code);
      this.parameters.set('processorresponse', register_response.getProcessorResponse());
      this.parameters.set('amount', register_response.parameters.get('transaction').amount);

      return true;

    });

  }

  updateEntities() {

    du.debug('Update Entities');

    let transaction = this.parameters.get('transaction');
    let rebill = this.parameters.get('rebill');
    let session = this.parameters.get('session');
    let product_schedules = this.parameters.get('productschedules');

    session.product_schedules = arrayutilities.merge(session.product_schedules, product_schedules);
    rebill.transactions = arrayutilities.merge(rebill.transactions, [transaction.id]);

    let promises = [
      this.sessionController.update({entity: session}).then(session => {
        this.parameters.set('session', session);
      }),
      this.rebillController.update({entity: rebill}).then(rebill => {
        this.parameters.set('rebill', rebill);
      })
    ];

    return Promise.all(promises).then(() => {

      return true;

    });

  }

  buildInfoObject(){

    du.debug('Build Info Object');

    //add amount,
    //add processor_response

    let info = {
      transaction: this.parameters.get('transaction'),
      product_schedules: this.parameters.get('productschedules'),
      customer: this.parameters.get('customer'),
      rebill: this.parameters.get('rebill'),
      session: this.parameters.get('session'),
      campaign: this.parameters.get('campaign'),
      creditcard: this.parameters.get('creditcard'),
      result: this.parameters.get('result')
    };

    this.parameters.set('info', info);

    return Promise.resolve(true);

  }

  postProcessing(){

    du.debug('Post Processing');

    let promises = [
      this.pushEventsRecord(),
      this.pushTransactionsRecord(),
      this.addRebillToQueue()
    ];

    return Promise.all(promises).then(() => {

      return true;

    });

  }

  addRebillToQueue(){

    du.debug('Add Rebill To Queue');

    let rebill = this.parameters.get('rebill');

    //Technical Debt:  This depends on result of the transaction...
    //Technical Debt:  We need a queue helper...

    return this.rebillController.addRebillToQueue(rebill, 'hold').then(() => {
      return true;
    });

  }

  pushEventsRecord(){

    du.debug('Push Events Record');

    let session = this.parameters.get('session');
    let product_schedules = this.parameters.get('productschedules');

    return this.pushEventToRedshift('order', session, product_schedules).then(() => {

      return true;

    });

  }

  pushTransactionsRecord(){

    du.debug('Push Transactions Record');

    let info = this.parameters.get('info');

    return this.pushTransactionToRedshift(info).then(() => {

      return true;

    });

  }

}

module.exports = new CreateOrderController();
