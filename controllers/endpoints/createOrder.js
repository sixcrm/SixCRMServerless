'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const CreditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

class CreateOrderController extends transactionEndpointController {

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
      'merchantprovidergroup/read',
      'merchantprovidergroupassociation/read',
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
      'event':global.SixCRM.routes.path('model', 'endpoints/createOrder/event.json'),
      'session': global.SixCRM.routes.path('model', 'entities/session.json'),
      'creditcard':global.SixCRM.routes.path('model', 'entities/creditcard.json'),
      'campaign':global.SixCRM.routes.path('model', 'entities/campaign.json'),
      'customer':global.SixCRM.routes.path('model', 'endpoints/components/customerprocessable.json'),
      'productschedules':global.SixCRM.routes.path('model','endpoints/components/productschedules.json'),
      'rebill':global.SixCRM.routes.path('model', 'entities/rebill.json'),
      'transaction':global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'info':global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'),
      'result':global.SixCRM.routes.path('model', 'functional/register/transactionresult.json'),
      'processorresponse':global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
      'amount':global.SixCRM.routes.path('model', 'definitions/currency.json'),
      'transactionsubtype':global.SixCRM.routes.path('model', 'definitions/transactionsubtype.json')
    };

    this.event_type = 'order';

    this.initialize();

  }

  execute(event){

    du.debug('Execute');

    this.parameters.store = {};

    return this.preamble(event)
    .then(() => this.createOrder());

  }

  createOrder(){

    du.debug('Create Order');

    return this.hydrateSession()
    .then(() => this.setCustomer())
    .then(() => this.hydrateEventAssociatedParameters())
    .then(() => this.validateEventProperties())
    .then(() => this.createRebill())
    .then(() => this.processRebill())
    .then(() => this.buildInfoObject())
    .then(() => {

      this.postProcessing();
      //Technical Debt:  We're going to want to prune this a bit...
      return this.parameters.get('info');

    });

  }

  hydrateSession(){

    du.debug('Set Session');

    let event = this.parameters.get('event');

    if(!_.has(this.sessionController)){
      this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
    }

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

    if(!_.has(this, 'campaignController')){
      this.campaignController = new CampaignController();
    }

    return this.campaignController.get({id: session.campaign}).then(campaign => {
      this.parameters.set('campaign', campaign);
      return true;
    });

  }

  setCreditCard(){

    du.debug('Set Credit Card');

    let event = this.parameters.get('event');

    if(_.has(event, 'creditcard')){

      if(!_.has(this, 'creditCardController')){
        this.creditCardController = new CreditCardController();
        this.creditCardController.sanitize(false);
      }

      return this.creditCardController.assureCreditCard(event.creditcard)
      .then(creditcard => {
        return this.parameters.set('creditcard', creditcard);
      })
      .then(() => this.addCreditCardToCustomer());

    }

    return Promise.resolve(true);

  }

  addCreditCardToCustomer(){

    du.debug('Add Credit Card to Customer');

    let creditcard = this.parameters.get('creditcard');
    let customer = this.parameters.get('customer');

    if(!_.has(this, 'customerController')){
      this.customerController = new CustomerController();
    }

    return this.customerController.addCreditCard(customer.id, creditcard).then((customer) => {
      this.parameters.set('customer', customer);
      return true;
    });

  }

  setCustomer(){

    du.debug('Set Customer');

    let session = this.parameters.get('session');
    let event = this.parameters.get('event');

    if(!_.has(this, 'customerController')){
        this.customerController = new CustomerController();
    }

    return this.customerController.get({id: session.customer}).then(customer => {
        if (_.has(event, 'customer')) {
            Object.assign(customer, event.customer);
            return this.customerController.update({entity: customer});
        }
        return customer;
    })
    .then(customer => {
        this.parameters.set('customer', customer);
        return true;
    });
  }

  validateEventProperties(){

    du.debug('Validate Event Properties');

    this.isCurrentSession();
    this.isCompleteSession();

    return Promise.resolve(true);

  }

  isCompleteSession(){

    du.debug('Is Complete Session');

    let session = this.parameters.get('session');

    if(!_.has(this, 'sessionHelperController')){
      const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

      this.sessionHelperController = new SessionHelperController();
    }

    if(this.sessionHelperController.isComplete({session: session})){
      eu.throwError('bad_request', 'The session is already complete.');
    }

    return true;

  }

  isCurrentSession(){

    du.debug('Is Current Session');

    let session = this.parameters.get('session');

    if(!_.has(this, 'sessionHelperController')){
      const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

      this.sessionHelperController = new SessionHelperController();
    }

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

    if(_.isNull(product_schedules) && _.isNull(products)){
      eu.throwError('server', 'Nothing to add to the rebill.');
    }

    if(!_.has(this, 'rebillCreatorHelperController')){
      const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');

      this.rebillCreatorHelperController = new RebillCreatorHelperController();
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

    const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
    let registerController = new RegisterController();

    return registerController.processTransaction({rebill: rebill}).then((register_response) =>{
      if(!_.has(this, 'transactionHelperController')){
        const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

        this.transactionHelperController = new TransactionHelperController();
      }

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

    this.pushEvent();
    this.incrementMerchantProviderSummary();
    this.updateSessionWithWatermark();
    this.addRebillToStateMachine();

    return true;

  }

  pushEvent(){

    du.debug('Push Event');

    return super.pushEvent('order');

  }

  incrementMerchantProviderSummary(){

    du.debug('Increment Merchant Provider Summary');

    let transactions = this.parameters.get('transactions');

    if(_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)){ return false; }

    const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');

    return arrayutilities.serial(transactions, (current, transaction) => {

      if(transaction.type != 'sale' || transaction.result != 'success'){ return false; }

      let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

      return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
        merchant_provider: transaction.merchant_provider,
        day: transaction.created_at,
        total: transaction.amount,
        type: 'new'
      });

    }, null);

  }

  updateSessionWithWatermark(){

    du.debug('Update Session With Watermark');

    let session = this.parameters.get('session');

    if(!_.has(session, 'watermark')){
      session.watermark = {
        products:[],
        product_schedules:[]
      }
    }

    let product_schedules = this.parameters.get('productschedules', null, false);
    let products = this.parameters.get('products', null, false);

    if(arrayutilities.nonEmpty(product_schedules)){

      if(!_.has(session.watermark, 'product_schedules')){
        session.watermark.product_schedules = [];
      }

      arrayutilities.map(product_schedules, product_schedule_group => {
        session.watermark.product_schedules.push(product_schedule_group);
      });
    }

    if(arrayutilities.nonEmpty(products)){

      if(!_.has(session.watermark, 'products')){
        session.watermark.products = [];
      }

      arrayutilities.map(products, product_group => {
        session.watermark.products.push(product_group);
      });

    }

    if(!_.has(this, 'sessionController')){
      this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
    }

    return this.sessionController.update({entity: session}).then(result => {
      this.parameters.set('session', result);
      return true;
    });

  }

  addRebillToStateMachine() {

    du.debug('Add Rebill To State Machine');

    if(this.parameters.get('result') == 'success'){

      return this.updateRebillState()
      .then(() => this.addRebillToQueue())

    }else{

      let rebill = this.parameters.get('rebill');

      rebill.no_process = true;

      if(!_.has(this, 'rebillController')){
        this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
      }

      return this.rebillController.update({entity: rebill}).then(() => {
        return true;
      });

    }

  }

  addRebillToQueue(){

    du.debug('Add Rebill To Queue');

    let rebill = this.parameters.get('rebill');

    if(!_.has(this, 'rebillHelperController')){
      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

      this.rebillHelperController = new RebillHelperController();
    }

    return this.rebillHelperController.addRebillToQueue({rebill: rebill, queue_name: 'hold'}).then(() => {
      return true;
    });

  }

  updateRebillState(){

    du.debug('Update Rebill State');

    let rebill = this.parameters.get('rebill');

    if(!_.has(this, 'rebillHelperController')){
      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

      this.rebillHelperController = new RebillHelperController();
    }

    return this.rebillHelperController.updateRebillState({rebill: rebill, new_state: 'hold'}).then(() => {
      return true;
    });

  }

}

module.exports = new CreateOrderController();
