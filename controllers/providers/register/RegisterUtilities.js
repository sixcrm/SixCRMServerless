'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities');

const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');

module.exports = class RegisterUtilities extends PermissionedController {

  constructor(){

    super();

  }

  acquireRebillProperties(){

    du.debug('Acquire Rebill Properties');

    let rebill = this.parameters.get('rebill');

    var promises = [];
    promises.push(this.rebillController.getParentSession(rebill));

    return Promise.all(promises).then((promises) => {

      this.parameters.set('parentsession', promises[0]);

      return true;

    });

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    const transaction = this.parameters.get('transaction');

    return this.rebillController.get({id: transaction.rebill}).then((rebill) => {

      this.parameters.set('rebill', rebill);

      return true;

    });

  }

  validateRebillForProcessing(){

    du.debug('Validate Rebill For Processing');

    return this.validateRebillTimestamp()
    .then(() => this.validateAttemptRecord())
    .then(() => this.validateSession())
    .catch((error) => {
      du.error(error);
      return Promise.reject(error);
    });

  }

  validateSession(){

    du.debug('Validate Session');

    let parentsession = this.parameters.get('parentsession');

    let rebillHelperController = new RebillHelperController();

    let day_in_cycle = rebillHelperController.calculateDayInCycle(parentsession.created_at);

    if(!_.isNumber(day_in_cycle) || day_in_cycle < 0){
      eu.throwError('server', 'Invalid day in cycle returned for session.');
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

        eu.throwError('server','Rebill\'s first attempt is too recent.');

      }

    }

    return Promise.resolve(true);

  }

  validateRebillTimestamp(){

    du.debug('Validate Rebill Timestamp');

    let rebill = this.parameters.get('rebill');

    let bill_at_timestamp = timestamp.dateToTimestamp(rebill.bill_at);

    if(timestamp.getTimeDifference(bill_at_timestamp) < 0){
      eu.throwError('server', 'Rebill is not eligible for processing at this time (rebill.bill_at: '+rebill.bill_at+')');
    }

    return Promise.resolve(true);

  }

  acquireRebillSubProperties(){

    du.debug('Acquire Rebill Sub-Properties');

    return this.acquireCustomer()
    .then(() => this.acquireCustomerCreditCards())
    .then(() => this.selectCustomerCreditCard())
    .then(() => this.acquireMerchantProviderGroups());

  }

  selectCustomerCreditCard(){

    du.debug('Select Customer Credit Card');

    let selected_creditcard = null;

    let creditcards = this.parameters.get('creditcards');

    arrayutilities.map(creditcards, (credit_card) => {

      if(_.has(credit_card, 'default') && credit_card.default == true){

        selected_creditcard = credit_card;

      }else if(_.isNull(selected_creditcard)){

        selected_creditcard = credit_card;

      }else if(!_.has(selected_creditcard, 'default') && credit_card.updated_at > selected_creditcard.updated_at){

        selected_creditcard = credit_card;

      }

    });

    if(_.isNull(selected_creditcard)){
      eu.throwError('server', 'Unable to set credit card for customer');
    }

    this.parameters.set('selectedcreditcard', selected_creditcard);

    return Promise.resolve(true);

  }

  acquireCustomer(){

    du.debug('Acquire Customer');

    let parentsession  = this.parameters.get('parentsession');

    return this.customerController.get({id: parentsession.customer}).then(customer => {

      this.parameters.set('customer', customer);

    });

  }

  acquireCustomerCreditCards(){

    du.debug('Acquire Customer Creditcard');

    let customer = this.parameters.get('customer');

    return this.customerController.getCreditCards(customer).then(creditcards => {

      this.parameters.set('creditcards', creditcards);

      return Promise.resolve(true);

    });

  }

  acquireMerchantProvider({id}){

    du.debug('Acquire Merchant Provider');

    return this.merchantProviderController.get({id: id}).then(result => {

      return result;

    });

  }

}
