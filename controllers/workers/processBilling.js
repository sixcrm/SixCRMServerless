'use strict';
const _ = require("underscore");

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilties = global.SixCRM.routes.include('lib', 'math-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

let sessionController = global.SixCRM.routes.include('entities', 'Session.js');
let productScheduleController = global.SixCRM.routes.include('entities', 'ProductSchedule.js');
let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
let customerController = global.SixCRM.routes.include('entities', 'Customer.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');
let ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

//Technical Debt:  This controller makes a lot of redundant database queries...  Needs a refactor.
class processBillingController extends workerController {

  constructor(){
    super();

    this.messages = {
      success: 'BILLED',
      failed: 'FAILED'
    };

    this.parameter_definition = {
      execute: {
        required: {
          event: 'event'
        },
        optional:{}
      }

    }

    this.parameter_validation = {
      event: global.SixCRM.routes.path('model', 'workers/processBilling/event.json'),
      rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
      transactionproducts: global.SixCRM.routes.path('model', 'workers/processBilling/transactionproducts.json'),
      productschedules:global.SixCRM.routes.path('model', 'workers/processBilling/productschedules.json'),
      parentsession: global.SixCRM.routes.path('model', 'entities/session.json'),
      creditcards: global.SixCRM.routes.path('model', 'workers/processBilling/creditcards.json'),
      amount: global.SixCRM.routes.path('model', 'definitions/currency.json'),
      customer: global.SixCRM.routes.path('model', 'entities/customer.json'),
      productschedule: global.SixCRM.routes.path('model', 'entities/productschedule.json'),
      registerresponse: global.SixCRM.routes.path('model', 'functional/register/response.json')
    }

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new Parameters({
      validation: this.parameter_validation,
      definition: this.parameter_definition
    });

  }

  execute(event){

    du.debug('Execute');

    return this.setParameters({argumentation: {event: event}, action: 'execute'})
    .then(() => this.acquireRebill())
		.then(() => this.processRebill());

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let event = this.parameters.get('event');

    return super.acquireRebill(event);

  }

  setParameters(thing){

    du.debug('Set Parameters');

    this.parameters.setParameters(arguments[0]);

    return Promise.resolve(true);

  }

  processRebill() {

    du.debug('Process Rebill');

    return this.acquireRebillProperties()
    .then(() => this.validateRebillForProcessing())
    .then(() => this.acquireRebillSubProperties())
    .then(() => this.calculateAmount())
    .then(() => this.process())
    .then(() => this.postProcessing())
    .then(() => this.respond());


  }

  validateRebillTimestamp(){

    du.debug('Validate Rebill Timestamp');

    let rebill = this.parameters.get('rebill');

    let bill_at_timestamp = timestamp.dateToTimestamp(rebill.bill_at);

    if(timestamp.getTimeDifference(bill_at_timestamp) < 0){
      eu.throwError('server', 'Rebill is not eligible for processing at this time.');
    }

    return Promise.resolve(true);

  }

  validateAttemptRecord(){

    du.debug('Validate Attempt Record');

    let rebill = this.parameters.get('rebill');

    if(_.has(rebill, 'second_attempt')){

      eu.throwError('server','The rebill has already been attempted three times.');

    }

    if(_.has(rebill, 'first_attempt')){

      let time_difference = timestamp.getTimeDifference(rebill.first_attempt);

      if(time_difference < (60 * 60 * 24)){

        eu.throwError('serber','Rebill\'s first attempt is too recent.');

      }

    }

    return Promise.resolve(true);

  }

  acquireRebillProperties(){

    du.debug('Acquire Rebill Properties');

    let rebill = this.parameters.get('rebill');

    var promises = [];

    //promises.push(rebillController.listTransactions(rebill));
    promises.push(rebillController.listProductSchedules(rebill));
    promises.push(rebillController.getParentSession(rebill));

    return Promise.all(promises).then((promises) => {

      //this.parameters.set('transactions', promises[0]);
      this.parameters.set('productschedules', promises[0]);
      this.parameters.set('parentsession', promises[1]);

      return true;

    });

  }

  validateSession(){

    du.debug('Validate Session');

    let parentsession = this.parameters.get('parentsession');

    var day_in_cycle = rebillController.calculateDayInCycle(parentsession.created_at);

    if(!_.isNumber(day_in_cycle) || day_in_cycle < 0){
      eu.throwError('server', 'Invalid day in cycle returned for session.');
    }

    return Promise.resolve(true);

  }

  validateRebillForProcessing(){

    du.debug('Validate Rebill For Processing');

    return this.validateRebillTimestamp()
    .then(() => this.validateAttemptRecord())
    .then(() => this.validateSession())
    .catch((error) => {
      return Promise.reject(error);
    });

  }

  acquireRebillSubProperties(){

    du.debug('Acquire Rebill Sub-Properties');

    let promises = [
      this.acquireProducts(),
      this.acquireCustomer()
    ];

    return Promise.all(promises)
    .then(() => this.acquireCustomerCreditCards())
    .then(() => Promise.resolve(true));

  }

  acquireProducts(){

    du.debug('Acquire Products');

    let parentsession = this.parameters.get('parentsession');
    let productschedules = this.parameters.get('productschedules');
    let day_in_cycle = rebillController.calculateDayInCycle(parentsession.created_at);

    let transaction_products = productScheduleController.getTransactionProducts(day_in_cycle, productschedules);

    this.parameters.set('transactionproducts', transaction_products);

    return Promise.resolve(true);

  }

  acquireCustomer(){

    du.debug('Acquire Customer');

    let parentsession  = this.parameters.get('parentsession');

    return customerController.get({id: parentsession.customer}).then(customer => {

      this.parameters.set('customer', customer);

    });

  }

  acquireCustomerCreditCards(){

    du.debug('Acquire Customer Creditcard');

    let customer = this.parameters.get('customer');

    return customerController.getCreditCards(customer).then(creditcards => {

      this.parameters.set('creditcards', creditcards);

      return Promise.resolve(true);

    });

  }

  calculateAmount(){

    du.debug('Calculate Amount');

    let transactionproducts = this.parameters.get('transactionproducts');

    let product_amounts = arrayutilities.map(transactionproducts, product => {
      return parseInt(product.amount);
    })

    let amount = mathutilities.sum(product_amounts);

    this.parameters.set('amount', amount);

    return Promise.resolve(true);

  }

  process(){

    du.debug('Process');

    let customer = this.parameters.get('customer');
    let product_schedule = this.parameters.get('productschedule');
    let transaction_products = this.parameters.get('transactionproducts');
    let amount = this.parameters.get('amount');

    const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
    let registerController = new RegisterController();

    return registerController.executeProcess({customer:customer}).then(response => {

      this.parameters.set('registerresponse', response);

      return Promise.resolve(true);

    });

  }

  postProcessing(){

    du.debug('Post Processing');

    return this.evaluateRegisterResponse()
    .then(() => this.markRebill());

  }

  respond(){

    du.debug('Respond');

    return Promise.resolve(true);

  }

  evaluateRegisterResponse(){

    du.debug('Evaluate Register Response');

    let register_response = this.parameters.get('registerresponse');

    if(register_response.message == 'success'){
      this.parameters.set('responsemessage', this.messages.success);
    }else{
      this.parameters.set('responsemessage', this.messages.failed);
    }

    return Promise.resolve(true);

  }

  //Technical Debt:  This methodology could lead to state issues.
  //Technical Debt:  We should create a updateField method in the Entity class to address exactly this sort of functionality across
  markRebill(){

    du.debug('Mark Rebill');

    let rebill = this.parameters.get('rebill');

    let now = timestamp.createTimestampSeconds();

    if(_.has(rebill, 'first_attempt')){

      rebill.second_attempt = now;

    }else{

      rebill.first_attempt = now;

    }

    return rebillController.update({entity: rebill}).then(() => {
      return true;
    });

  }

}

module.exports = new processBillingController();
