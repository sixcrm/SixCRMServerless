'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');

module.exports = class RegisterUtilities extends PermissionedController {

  constructor(){

    super();

    const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

    this.rebillHelperController = new RebillHelperController();

    //const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
    //this.productScheduleHelperController = new ProductScheduleHelperController();

  }

  acquireRebillProperties(){

    du.debug('Acquire Rebill Properties');

    let rebill = this.parameters.get('rebill');

    return this.rebillController.getParentSession(rebill).then(result => {
      this.parameters.set('parentsession', result);
      return true;
    })

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

    let day_in_cycle = this.rebillHelperController.calculateDayInCycle(parentsession.created_at);

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

    if(!this.rebillHelperController.isAvailable({rebill: rebill})){
      eu.throwError('server', 'Rebill is not eligible for processing at this time.');
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

  acquireMerchantProviderGroups(){

    du.debug('Acquire Merchant Provider Groups');

    let rebill =  this.parameters.get('rebill');
    let creditcard = this.parameters.get('selectedcreditcard');

    if(_.has(rebill, 'merchant_provider')){

      //Note:  Merchant Provider is provided in the rebill so, we're hotwiring the SOB
      let merchant_provider_groups = {};

      merchant_provider_groups[rebill.merchant_provider] = rebill.products;

      this.parameters.set('merchantprovidergroups', merchant_provider_groups);

      return Promise.resolve(true);

    }else{

      const MerchantProviderSelectorHelperController = global.SixCRM.routes.include('helpers','transaction/MerchantProviderSelector.js');
      let merchantProviderSelectorHelperController = new MerchantProviderSelectorHelperController();

      return merchantProviderSelectorHelperController.buildMerchantProviderGroups({rebill: rebill, creditcard: creditcard})
      .then((merchant_provider_groups) => {

        this.parameters.set('merchantprovidergroups', merchant_provider_groups);

        return true;

      });

    }

  }

  hydrateTransaction(){

    du.debug('Hydrate Transaction');

    let transaction = this.parameters.get('transaction');

    return this.transactionController.get({id: transaction, fatal: true}).then(transaction => {

      this.parameters.set('associatedtransaction', transaction);

      return transaction;

    })

  }

  selectCustomerCreditCard(){

    du.debug('Select Customer Credit Card');

    let creditcards = this.parameters.get('creditcards');

    let selected_creditcard = arrayutilities.reduce(
      creditcards,
      (selected_creditcard, creditcard) => {

        if(_.isNull(selected_creditcard)){
          return creditcard;
        }

        if(_.has(creditcard, 'default') && creditcard.default == true){
          return creditcard;
        }

        if(creditcard.updated_at > selected_creditcard.updated_at){
          return creditcard;
        }

        return selected_creditcard;

      },
      null
    );

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

      return this.parameters.set('customer', customer);

    });

  }

  acquireCustomerCreditCards(){

    du.debug('Acquire Customer Creditcard');

    let customer = this.parameters.get('customer');

    return this.customerController.getCreditCards(customer).then(creditcards => {

      return this.parameters.set('creditcards', creditcards);

    });

  }

  acquireMerchantProvider({id}){

    du.debug('Acquire Merchant Provider');

    return this.merchantProviderController.get({id: id}).then(result => {
      return result;

    });

  }

}
