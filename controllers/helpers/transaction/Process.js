'use strict'
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const mvu = global.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

module.exports = class Process{

    constructor(){

        this.required_parameters = ['customer','product_schedule','amount'];

        this.optional_parameters = [];

        this.productScheduleController = global.routes.include('entities','ProductSchedule.js');

        this.loadBalancerController = global.routes.include('entities','LoadBalancer.js');

        this.creditCardHelper = global.routes.include('helpers', 'creditcard/CreditCard.js');

    }

    process(parameters){

        du.debug('Process');

        return this.setParameters(parameters)
      .then(() => this.validateParameters)
      .then(() => this.selectCustomerCreditCard)
      .then(() => this.preprocessing)
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

    validateParameters(){

        du.debug('Validate Parameters');

        this.required_parameters.forEach((required_parameter) => {

            mvu.validateModel(this[required_parameter], global.routes.path('model','transaction/'+required_parameter+'.json'));

        });

    }

    selectCustomerCreditCard(){

        du.debug('Select Customer Credit Card');

        /*
        Note:  This method selects (in order)
        (1) the card marked default
        (2) the most recently updated card
        (3) the first credit card in the list
        */

        if(!_.has(this.customer, 'creditcards') || !_.isArray(this.customer.creditcards) || this.customer.creditcards.length < 1){
            eu.throwError('bad_request','Customer is not associated with a credit card.');
        }

        let selected_credit_card = null;

        this.customer.creditcards.forEach((credit_card) => {

            if(!_.has(credit_card, 'updated_at')){ eu.throwError('validation','Credit card is missing the "updated_at" field.'); }

            if(_.has(credit_card, 'default') && credit_card.default == true){

                selected_credit_card = credit_card;

                return;

            }

            if(_.isNull(selected_credit_card) || credit_card.updated_at > selected_credit_card.updated_at){

                selected_credit_card = credit_card;

            }

        });

        if(_.isNull(selected_credit_card)){
            eu.throwError('not_found','Unable to set credit card for customer');
        }

        this.credit_card = selected_credit_card;

        return Promise.resolve(true);

    }

    preprocessing(){

        du.debug('Preprocessing');

        return this.creditCardHelper.getProperties(this.credit_card).then((properties) => {

            if(_.isNull(properties)){

                eu.throwError('not_found','Unable to identify credit card properties.');

                return false;

            }

            this.credit_card.properties = properties;

            return true;

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
