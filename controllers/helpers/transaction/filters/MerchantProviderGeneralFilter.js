'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

module.exports = class MerchantProviderGeneralFilter {

  static filter({merchant_providers, creditcard, amount}){

    du.debug('Filter Merchant Providers');

    return this.filterInvalidMerchantProviders(merchant_providers)
    .then((merchant_providers) => this.filterDisabledMerchantProviders(merchant_providers))
    .then((merchantproviders) => this.filterTypeMismatchedMerchantProviders(merchantproviders, creditcard))
    .then((merchantproviders) => this.filterCAPShortageMerchantProviders(merchantproviders, amount))
    .then((merchantproviders) => this.filterCountShortageMerchantProviders(merchantproviders))
    .then((merchantproviders) => {
      return merchantproviders;
    });

  }

  static filterInvalidMerchantProviders(merchant_providers){

    du.debug('Filter Invalid Merchant Providers');

    if(!arrayutilities.nonEmpty(merchant_providers)){
      eu.throwError('server', 'No merchant providers to select from.');
    }

    let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

      return (_.has(merchant_provider, 'summary'));

    });

    return Promise.resolve(return_array);

  }

  static filterDisabledMerchantProviders(merchant_providers){

    du.debug('Filter Disabled Merchant Providers');

    if(!arrayutilities.nonEmpty(merchant_providers)){
      eu.throwError('server', 'No merchant providers to select from.');
    }

    let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {
      return (merchant_provider.enabled == true);
    });

    return Promise.resolve(return_array);

  }

  static filterTypeMismatchedMerchantProviders(merchant_providers, creditcard){

    du.debug('Filter Type Mismatched Merchant Providers');

    if(!arrayutilities.nonEmpty(merchant_providers)){
      eu.throwError('server', 'No merchant providers to select from.');
    }

    let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

      let accepted_payment_methods_array = arrayutilities.map(merchant_provider.accepted_payment_methods, (accepted_payment_method) => {
        return this.makeGeneralBrandString(accepted_payment_method);
      });

      return _.contains(accepted_payment_methods_array, this.makeGeneralBrandString(creditcard.properties.brand));

    });

    return Promise.resolve(return_array);

  }

  static filterCAPShortageMerchantProviders(merchant_providers, amount){

    du.debug('Filter CAP Shortage Merchant Providers');

    if(!arrayutilities.nonEmpty(merchant_providers)){
      eu.throwError('server', 'No merchant providers to select from.');
    }

    merchant_providers = arrayutilities.filter(merchant_providers, (merchant_provider) => {

      if(objectutilities.hasRecursive(merchant_provider, 'processing.monthly_cap') && !_.isNull(merchant_provider.processing.monthly_cap)){

        //Technical Debt:  Lets abstract this to a different function
        let proposed_total = (parseFloat(merchant_provider.summary.summary.thismonth.amount) + parseFloat(amount));
        let cap = parseFloat(merchant_provider.processing.monthly_cap);

        if((proposed_total >= cap)){
          du.warning('CAP Shortage')
          du.info(merchant_provider, amount);
          return false;
        }

      }

      return true;

    });


    return Promise.resolve(merchant_providers);

  }

  static filterCountShortageMerchantProviders(merchant_providers){

    du.debug('Filter Count Shortage Merchant Providers');

    if(!arrayutilities.nonEmpty(merchant_providers)){
      eu.throwError('server', 'No merchant providers to select from.');
    }

    let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

      let return_value = true;

      if(objectutilities.hasRecursive(merchant_provider, 'processing.transaction_counts.daily') && !_.isNull(merchant_provider.processing.transaction_counts.daily)){

        if(parseInt(merchant_provider.summary.summary.today.count) >= parseInt(merchant_provider.processing.transaction_counts.daily)){
          du.warning('Daily Count Shortage');
          return_value = false;
        }

      }

      if(objectutilities.hasRecursive(merchant_provider, 'processing.transaction_counts.weekly') && !_.isNull(merchant_provider.processing.transaction_counts.weekly)){

        if(parseInt(merchant_provider.summary.summary.thisweek.count) >= parseInt(merchant_provider.processing.transaction_counts.weekly)){
          du.warning('Weekly Count Shortage');
          return_value = false;
        }

      }

      if(objectutilities.hasRecursive(merchant_provider, 'processing.transaction_counts.monthly') && !_.isNull(merchant_provider.processing.transaction_counts.monthly)){

        if(parseInt(merchant_provider.summary.summary.thismonth.count) >= parseInt(merchant_provider.processing.transaction_counts.monthly)){
          du.warning('Monthly Count Shortage');
          return_value = false;
        }

      }

      if(return_value == false){
        du.info(merchant_provider);
      }

      return return_value;

    });

    return Promise.resolve(return_array);

  }

  static makeGeneralBrandString(a_string){

    du.debug('Make General Brand String');

    stringutilities.isString(a_string, true);

    let transformed_string = stringutilities.removeWhitespace(a_string).toLowerCase();

    if(_.has(this.brandaliases, transformed_string)){
      return this.brandaliases[transformed_string];
    }

    return transformed_string;

  }

}
