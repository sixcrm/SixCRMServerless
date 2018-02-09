'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

class CreateOrderController extends transactionEndpointController{

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

    this.notification_parameters = {
      type: 'order',
      action: 'added',
      title: 'A new order',
      body: 'A new order has been created.'
    };

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
      'transactionsubtype':global.SixCRM.routes.path('model', 'definitions/transactionsubtype.json')
    };

    this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
    this.creditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
    this.campaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
    this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

    const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');

    this.rebillCreatorHelperController = new RebillCreatorHelperController();

    const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

    this.rebillHelperController = new RebillHelperController();

    const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

    this.transactionHelperController = new TransactionHelperController();

    const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

    this.sessionHelperController = new SessionHelperController();

    this.initialize(() => {
      //this.parameters.set('sessionlength', global.SixCRM.configuration.site_config.jwt.transaction.expiration);
    });

  }

  execute(event){

    du.debug('Execute');

    return this.preamble(event)
    .then(() => this.createOrder());

  }

  createOrder(){

    du.debug('Create Order');

    return this.hydrateSession()
    .then(() => this.hydrateEventAssociatedParameters())
    .then(() => this.setCustomer())
    .then(() => this.validateEventProperties())
    .then(() => this.createRebill())
    .then(() => this.processRebill())
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
      this.setProducts(),
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

    if(_.has(event, 'product_schedules')){
      this.parameters.set('productschedules', event.product_schedules);
    }

    return Promise.resolve(true);

  }

  setProducts(){

    du.debug('Set Products');

    let event = this.parameters.get('event');

    if(_.has(event, 'products')){
      this.parameters.set('products', event.products);
    }

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

    //this.hasCampaignProductScheduleParity();
    //this.hasCampaignProductParity();

    return Promise.resolve(true);

  }

  hasCampaignProductParity(){

    du.debug('Has Campaign Product Parity');

    let campaign = this.parameters.get('campaign');
    let products = this.parameters.get('products', null, false);

    if(arrayutilities.nonEmpty(products)){

      arrayutilities.map(products, product_group => {
        //Technical Debt:  Some manner of validation
      });

    }

    return true;

  }

  hasCampaignProductScheduleParity(){

    du.debug('Has Campaign ProductSchedule Parity');

    let campaign = this.parameters.get('campaign');
    let product_schedules = this.parameters.get('productschedules', null, false);

    if(arrayutilities.nonEmpty(product_schedules)){

      arrayutilities.map(product_schedules, product_schedule_group => {

        if(_.isString(product_schedule_group.product_schedule)){

          if(!_.contains(campaign.productschedules, product_schedule_group.product_schedule)){
            eu.throwError('bad_request', 'The product schedule provided is not a part of the campaign.');
          }

        }else if(_.isObject(product_schedule_group.product_schedule)){

          arrayutilities.map(product_schedule_group.product_schedule.schedule, schedule_element => {
            //Technical Debt:  What if I create the product at purchase time?
            if(!_.contains(campaign.products, schedule_element.product)){
              eu.throwError('bad_request', 'The product contained in the watermark schedule provided is not a part of the campaign.');
            }

          });

        }

      });

    }

    return true;

  }

  isCompleteSession(){

    du.debug('Is Complete Session');

    let session = this.parameters.get('session');

    if(this.sessionHelperController.isComplete({session: session})){
      eu.throwError('bad_request', 'The session is already complete.');
    }

    return true;

  }

  isCurrentSession(){

    du.debug('Is Current Session');

    let session = this.parameters.get('session');

    if(!this.sessionHelperController.isCurrent({session: session})){
      if(!_.contains(['*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c'], global.account)){
        eu.throwError('bad_request', 'Session has expired.');
      }
    }

    return true;

  }

  createRebill() {

    du.debug('Create Rebill');

    let session = this.parameters.get('session');
    let product_schedules = this.parameters.get('productschedules', null, false);
    let products = this.parameters.get('products', null, false);

    let argumentation = {
      session: session,
      day: -1
    };

    if(!_.isNull(product_schedules)){
      argumentation.product_schedules = product_schedules;
    }

    if(!_.isNull(products)){
      argumentation.products = products;
    }

    return this.rebillCreatorHelperController.createRebill(argumentation)
    .then(rebill => {
      this.parameters.set('rebill', rebill);
      return true;
    });

  }

  processRebill(){

    du.debug('Process Rebill');

    let rebill = this.parameters.get('rebill');

    let registerController = new RegisterController();

    return registerController.processTransaction({rebill: rebill}).then((register_response) =>{

      let amount = this.transactionHelperController.getTransactionsAmount(register_response.parameters.get('transactions'));

      this.parameters.set('creditcard', register_response.getCreditCard());
      this.parameters.set('transactions', register_response.parameters.get('transactions'));
      this.parameters.set('result', register_response.parameters.get('response_type'));
      this.parameters.set('amount', amount);

      return true;

    });

  }

  buildInfoObject(){

    du.debug('Build Info Object');

    let info = {
      amount: this.parameters.get('amount'),
      transactions: this.parameters.get('transactions'),
      customer: this.parameters.get('customer'),
      rebill: this.parameters.get('rebill'),
      session: this.parameters.get('session'),
      campaign: this.parameters.get('campaign'),
      creditcard: this.parameters.get('creditcard'),
      result: this.parameters.get('result')
    };

    let product_schedules = this.parameters.get('productschedules', null, false);

    if(!_.isNull(product_schedules)){
      info.product_schedules = product_schedules;
    }

    let products = this.parameters.get('products', null, false);

    if(!_.isNull(products)){
      info.products = products;
    }

    this.parameters.set('info', info);

    return Promise.resolve(true);

  }

  postProcessing(){

    du.debug('Post Processing');

    let promises = [
      this.pushEventsRecord(),
      this.addRebillToStateMachine()
    ];

    return Promise.all(promises).then(() => {

      return true;

    });

  }

  addRebillToStateMachine() {

    du.debug('Add Rebill To State Machine');

    if(this.parameters.get('result') == 'success'){

      return this.updateRebillState()
      .then(() => this.addRebillToQueue())

    }else{

      return this.rebllController.delete({id: this.parameters.get('rebill').id}).then(result => {
        return true;
      });

    }

  }

  addRebillToQueue(){

    du.debug('Add Rebill To Queue');

    let rebill = this.parameters.get('rebill');

    return this.rebillHelperController.addRebillToQueue({rebill: rebill, queue_name: 'hold'}).then(() => {
      return true;
    });

  }

  updateRebillState(){

    du.debug('Update Rebill State');

    let rebill = this.parameters.get('rebill');

    return this.rebillHelperController.updateRebillState({rebill: rebill, new_state: 'hold'}).then(() => {
      return true;
    });

  }

  pushEventsRecord(){

    du.debug('Push Events Record');

    let session = this.parameters.get('session');
    let product_schedules = this.parameters.get('productschedules', null, false);
    let rebill = this.parameters.get('rebill');

    if(_.isArray(product_schedules)){
      product_schedules = arrayutilities.map(product_schedules, product_schedule_group => {
        return product_schedule_group.product_schedule.id
      });
    }else{
      product_schedules = [];
    }

    let products = arrayutilities.map(rebill.products, product_group => product_group.product);

    //Technical Debt:  Note that this is missing the result of the transactions...
    return this.pushEventToRedshift({
      event_type: 'order',
      session: session,
      product_schedules: product_schedules,
      products: products
    }).then(() => {

      return true;

    });

  }

}

module.exports = new CreateOrderController();
