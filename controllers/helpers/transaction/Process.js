'use strict'
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const mvu = global.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

module.exports = class Process{

    constructor(){

        this.required_parameters = ['customer','productschedule','amount'];

        this.optional_parameters = ['merchantprovider'];

        this.productScheduleController = global.routes.include('entities','ProductSchedule.js');

        this.loadBalancerController = global.routes.include('entities','LoadBalancer.js');

        this.customerController = global.routes.include('entities','Customer.js');

        this.creditCardController = global.routes.include('entities','CreditCard.js');

        this.analyticsController = global.routes.include('analytics', 'Analytics.js');

        //this.creditCardHelper = global.routes.include('helpers', 'creditcard/CreditCard.js');

    }

    process(parameters){

      du.debug('Process');

      return this.setParameters(parameters)
      .then(() => this.hydrateParameters)
      .then(() => this.validateParameters)
      .then(() => this.selectCustomerCreditCard)
      .then(() => this.getSelectedCreditCardProperties)
      .then(() => this.selectMerchantProvider)
      .then(() => this.processTransaction)
      .then(() => this.storeTransaction)
      .then(() => this.respond);

    }

    setParameters(parameters){

        du.debug('Set Parameters');

        this.required_parameters.forEach((required_parameter) => {

            if(_.has(parameters, required_parameter)){

                this[required_parameter] = parameters[required_parameter]

            }else{

                eu.throwError('server','Process class parameters missing required field:"'+required_parameter+'".');

            }

        });

        this.optional_parameters.forEach((optional_parameter) => {

          if(_.has(parameters, optional_parameter)){

            this[optional_parameter] = parameters[optional_parameter]

          }

        });

    }

    hydrateParameters(){

      du.debug('Hydrate Parameters');

      let getCustomer = null;
      let getProductSchedule = null;

      if(_.has(this, 'customer')){

        if(!_.isObject(this.customer) && _.isString(this.customer) && this.customerController.isUUID(this.customer)){

          this.customerController.disableACLs();
          getCustomer = this.customerController.get(this.customer);
          this.customerController.enableACLs();

        }else{

          getCustomer = this.customer;

        }

      }

      if(_.has(this, 'productschedule')){

        if(!_.isObject(this.productschedule) && _.isString(this.productschedule) && this.productScheduleController.isUUID(this.productschedule)){

          this.productScheduleController.disableACLs();
          getProductSchedule = this.productScheduleController.get(this.productschedule);
          this.productScheduleController.enableACLs();

        }else{

          getProductSchedule = this.productschedule;

        }

      }

      return Promise.all([getCustomer, getProductSchedule]).then((promises) => {

        this.customer = promises[0];

        this.productschedule = promises[1];

      });

    }

    validateParameters(){

      du.debug('Validate Parameters');

      this.required_parameters.forEach((required_parameter) => {

        mvu.validateModel(this[required_parameter], global.routes.path('model','transaction/'+required_parameter+'.json'));

      });

      return true;

    }

    hydrateCreditCards(){

      du.debug('Hydrate Credit Cards');

      this.creditCardController.disableACLs();
      let promises = this.customer.creditcards.map((creditcard) => this.creditCardController.get(creditcard));

      this.creditCardController.enableACLs();

      return Promise.all(promises).then((promises) => {

        this.customer.creditcards = promises;

        return true;

      });

    }

    selectCustomerCreditCard(){

        du.debug('Select Customer Credit Card');

        let selected_credit_card = null;

        this.customer.creditcards.forEach((credit_card) => {

          mvu.validateModel(credit_card, global.routes.path('model','transaction/creditcard.json'));

          if(_.has(credit_card, 'default') && credit_card.default == true){

            selected_credit_card = credit_card;

            return;

          }

          if(_.isNull(selected_credit_card) || credit_card.updated_at > selected_credit_card.updated_at){

            selected_credit_card = credit_card;

          }

        });

        if(_.isNull(selected_credit_card)){
            eu.throwError('server', 'Unable to set credit card for customer');
        }

        this.selected_credit_card = selected_credit_card;

        return Promise.resolve(this.selected_credit_card);

    }

    setBINNumber(){

      du.debug('Set BIN Number');

      let binnumber = this.creditCardController.getBINNumber(this.selected_credit_card.number);

      if(_.isNull(binnumber)){

        eu.throwError('server', 'Unable to determine BIN Number.');

      }

      this.selected_credit_card.bin = binnumber;

      return binnumber;

    }

    getSelectedCreditCardProperties(){

      du.debug('Get Credit Card Properties');

      let analytics_parameters = {binnumber:[this.selected_credit_card.bin]};

      return this.analyticsController.getBINList(analytics_parameters).then((properties) => {

        if(_.isNull(properties)){

          eu.throwError('not_found','Unable to identify credit card properties.');

        }

        if(_.has(properties, 'bins') && _.isArray(properties.bins) && properties.bins.length > 0){

          this.selected_credit_card.properties = properties.bins[0];

          return properties[0];

        }

        return null;

      });

    }

    selectMerchantProvider(){

        du.debug('Select Merchant Provider');

        return this.getLoadBalancers()
      .then((loadbalancers) => this.selectLoadBalancer(loadbalancers))
      .then((loadbalancer) => this.getMerchantProviders(loadbalancer))
      .then((merchant_providers) => this.filterMerchantProviders(merchant_providers))
      .then((merchant_providers) => this.selectMerchantProviderWithDistributionLeastSumOfSquares(merchant_providers))
      .then((merchant_provider) => {

          this.selected_merchant_provider = merchant_provider;

          return true;

      });

    }

    getLoadBalancers(){

        du.debug('Get Loadbalancers');

        return this.productScheduleController.getLoadBalancers(this.product_schedule);

    }

    getMerchantProviders(loadbalancer){

        du.debug('Get Merchant Providers');

        return this.loadBalancerController.getMerchantProviders(loadbalancer);

    }

    //Technical Debt:  Finish
    //Note:  I believe that load balancer properties like "prepaid need to be set..."
    selectLoadBalancer(loadbalancers){

        du.debug('Select Load Balancer');

        return Promise.resolve(loadbalancers[0]);

    }

    filterMerchantProviders(merchant_providers){

        du.debug('Filter Merchant Providers');

        return this.filterDiabledMerchantProviders(merchant_providers)
      .then((merchant_providers) => this.filterTypeMismatchedMerchantProviders(merchant_providers))
      .then((merchant_providers) => this.filterCAPShortageMerchantProviders(merchant_providers))
      .then((merchant_providers) => this.filterCountShortageMerchantProviders(merchant_providers));

    }

    filterDisabledMerchantProviders(merchant_providers){

        du.debug('Filter Disabled Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

            if(!_.has(merchant_provider, 'enabled')){
                eu.throwError('server','Merchant Provider missing "enabled" field.');
            }

            return merchant_provider.enabled;

        });

        return Promise.resolve(return_array);

    }

    filterTypeMismatchedMerchantProviders(merchant_providers){

        du.debug('Filter Type Mismatched Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        //Finish
            if(!_.has(merchant_provider, 'enabled')){
                eu.throwError('server','Merchant Provider missing "enabled" field.');
            }

            return merchant_provider.enabled;

        });

        return Promise.resolve(return_array);

    }

    filterCAPShortageMerchantProviders(merchant_providers){

        du.debug('Filter CAP Shortage Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        //Finish
            if(!_.has(merchant_provider, 'enabled')){
                eu.throwError('server','Merchant Provider missing "enabled" field.');
            }

            return merchant_provider.enabled;

        });

        return Promise.resolve(return_array);

    }

    filterCountShortageMerchantProviders(merchant_providers){

        du.debug('Filter Count Shortage Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        //Finish
            if(!_.has(merchant_provider, 'enabled')){
                eu.throwError('server','Merchant Provider missing "enabled" field.');
            }

            return merchant_provider.enabled;

        });

        return Promise.resolve(return_array);

    }

    processTransaction(){

        du.debug('Process Transaction');

      //instantiate the appropriate vendor class
      //run the transaction

    }

    storeTransaction(){

        du.debug('Store Transaction');
      //regardless of outcome, store the transaction results

    }

    respond(){

        du.debug('Respond');
      //give some meaningful response

    }

}
