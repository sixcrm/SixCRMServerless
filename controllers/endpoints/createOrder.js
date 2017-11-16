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
      'transactionsubtype':global.SixCRM.routes.path('model', 'definitions/transactionsubtype.json'),
      'sessionlength':global.SixCRM.routes.path('model', 'definitions/nonnegativeinteger.json')
    };

    this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
    this.creditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
    this.campaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
    this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

    this.initialize(() => {
      this.parameters.set('sessionlength', global.SixCRM.configuration.site_config.jwt.transaction.expiration);
    });

  }

  execute(event){

    du.debug('Execute');

    return this.preprocessing((event))
		.then((event) => this.acquireBody(event))
    .then((event_body) => {
      this.parameters.setParameters({argumentation:{event: event_body}, action: 'execute'});
      //this.parameters.set('sessionlength', global.SixCRM.configuration.site_config.jwt.transaction.expiration);
    })
    .then(() => this.hydrateSession())
    .then(() => this.hydrateEventAssociatedParameters())
    .then(() => this.setCustomer())
    .then(() => this.validateEventProperties())
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

  hydrateSession(){

    du.debug('Set Session');

    let event = this.parameters.get('event');

    return this.sessionController.get({id: event.session}).then(session => {
      this.parameters.set('session', session);
      return true;
    });

  }

  hydrateEventAssociatedParameters(){

    du.debug('Hydrate Event Associated Parameters');

    let promises = [
      this.setProductSchedules(),
      this.setTransactionSubType(),
      this.setCreditCard(),
      this.setCampaign()
    ];

    return Promise.all(promises).then(() => {
      return true;
    });

  }

  setProductSchedules(){

    du.debug('Set Product Schedules');

    let event = this.parameters.get('event');

    this.parameters.set('productschedules', event.product_schedules);

    return Promise.resolve(true);

  }


  setTransactionSubType(){

    du.debug('Set Transaction Subtype');

    let event = this.parameters.get('event');

    if(_.has(event, 'transaction_subtype')){
      this.parameters.set('transactionsubtype', event.transaction_subtype);
    }else{
      this.parameters.set('transactionsubtype', 'main');
    }

    return Promise.resolve(true);

  }

  setCampaign(){

    du.debug('Set Campaign');

    let session =  this.parameters.get('session');

    return this.campaignController.get({id: session.campaign}).then(campaign => {

      this.parameters.set('campaign', campaign);
      return true;

    });

  }

  setCreditCard(){

    du.debug('Set Credit Card');

    let event = this.parameters.get('event');

    if(_.has(event, 'creditcard')){

      return this.creditCardController.assureCreditCard(event.creditcard)
      .then(creditcard => {
        this.parameters.set('creditcard', creditcard);
      })
      .then(() => this.addCreditCardToCustomer());

    }

    return Promise.resolve(true);

  }

  addCreditCardToCustomer(){

    du.debug('Add Credit Card to Customer');

    let session = this.parameters.get('session');
    let creditcard = this.parameters.get('creditcard');

    return this.customerController.addCreditCard(session.customer, creditcard).then((customer) => {

      this.parameters.set('customer', customer);

      return true;

    });

  }

  setCustomer(){

    du.debug('Set Customer');

    let customer = this.parameters.get('customer', null, false);

    if(_.isNull(customer)){

      let session = this.parameters.get('session');

      return this.customerController.get({id: session.customer}).then(customer => {

        this.parameters.set('customer', customer);

        return true;

      });

    }

    return Promise.resolve(true);

  }

  validateEventProperties(){

    du.debug('Validate Event Properties');

    this.isCurrentSession();
    this.isCompleteSession();
    this.hasCampaignProductScheduleParity();

    return Promise.resolve(true);

  }

  hasCampaignProductScheduleParity(){

    du.debug('Has Campaign ProductSchedule Parity');

    let campaign = this.parameters.get('campaign');
    let product_schedules = this.parameters.get('productschedules');

    arrayutilities.map(product_schedules, product_schedule => {
      if(!_.contains(campaign.productschedules, product_schedule)){
        eu.throwError('bad_request', 'The product schedule provided is not a part of the campaign.');
      }
    });

    return true;

  }

  //Technical Debt:  Session Helper
  isCompleteSession(){

    du.debug('Is Complete Session');

    let session = this.parameters.get('session');

    if(session.completed == true){
      eu.throwError('bad_request', 'The session is already complete.');
    }

    return true;

  }

  //Technical Debt: Session Helper
  isCurrentSession(){

    du.debug('Is Current Session');

    let session = this.parameters.get('session');

    let session_length = this.parameters.get('sessionlength');

    let expired = session.created_at < timestamp.toISO8601(timestamp.createTimestampSeconds() - session_length);

    if(expired){
      eu.throwError('bad_request', 'Session has expired.');
    }

    return true;

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

      this.parameters.set('creditcard', register_response.getCreditCard());
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

    if(_.has(rebill, 'transactions') && arrayutilities.nonEmpty(rebill.transactions)){
      rebill.transactions = arrayutilities.merge(rebill.transactions, [transaction.id]);
    }else{
      rebill.transactions = [transaction.id];
    }

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

    let info = {
      amount: this.parameters.get('amount'),
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

    return this.pushEventToRedshift({event_type: 'order', session: session, product_schedules: product_schedules}).then(() => {

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
