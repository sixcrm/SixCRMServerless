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

module.exports =  class MerchantProvidersLSSFilter {

  static filter({merchant_providers, loadbalancer}){

    du.debug('Select Merchant Provider With Distribution Least Sum of Squares');

    if(arrayutilities.nonEmpty(merchantproviders)){

      if(merchantproviders.length == 1){

        return Promise.resolve(merchantproviders[0]);

      }else{

        return this.calculateMerchantProvidersSum()
        .then(() => this.calculateDistributionTargetsArray())
        .then(() => this.calculateHypotheticalBaseDistributionArray())
        .then(() => this.selectMerchantProviderFromLSS());

      }

    }

    return Promise.resolve(null);

  }

  calculateMerchantProvidersSum(){

    du.debug('Calculate Loadbalancer Sum');

    let sum_array = arrayutilities.map(merchantproviders, lb_merchantprovider => {

      let merchantprovider = arrayutilities.find(merchantproviders, (merchantprovider => {
        return (merchantprovider.id == lb_merchantprovider.id);
      }));

      if(objectutilities.hasRecursive(merchantprovider, 'summary.summary.thismonth.amount')){
        return parseFloat(merchantprovider.summary.summary.thismonth.amount);
      }

      du.warning('Merchant Provider missing critical properties: "merchantprovider.summary.summary.thismonth.amount".');

      return null;

    });

    if(!arrayutilities.nonEmpty(sum_array)){
      eu.throwError('server', 'Process.calculateLoadBalancerSum assumes a non-empty array of merchant provider sums.');
    }

    //Technical Debt:  These things could be null, objects, whatever.  Need to validate that they are all numeric.
    let sum = mathutilities.sum(sum_array);

    if(!_.isNumber(sum)){
      eu.throwError('server', 'Process.calculateLoadBalancerSum assumes a sum of merchant providers to be numeric.');
    }

    selected_loadbalancer.monthly_sum = sum;

    this.parameters.set('selected_loadbalancer', selected_loadbalancer);

    return Promise.resolve(sum);

  }

  calculateDistributionTargetsArray(){

    du.debug('Calculate Distribution Targets Array');

    let merchantproviders = this.parameters.get('merchantproviders');

    let distribution_targets_array = arrayutilities.map(merchantproviders, (merchantprovider) => {
      return this.getMerchantProviderTargetDistribution(merchantprovider);
    });

    return Promise.all(distribution_targets_array).then(distribution_targets_array => {

      this.parameters.set('target_distribution_array', distribution_targets_array);

      return distribution_targets_array;

    });

  }

  getMerchantProviderTargetDistribution(merchantprovider){

    du.debug('Get Merchant Provider');

    let selected_loadbalancer = this.parameters.get('selected_loadbalancer', ['merchantproviders']);

    if(!arrayutilities.nonEmpty(selected_loadbalancer.merchantproviders)){
      eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer.merchantproviders an array and has length greater than 0');
    }

    let loadbalancer_mp = arrayutilities.find(selected_loadbalancer.merchantproviders, (lb_mp) => {
      return (lb_mp.id == merchantprovider.id);
    });

    if(!_.has(loadbalancer_mp, 'id') || !_.has(loadbalancer_mp, 'distribution')){
      eu.throwError('server','Process.getMerchantProviderTarget is unable to determine the merchant_provider');
    }

    return Promise.resolve(loadbalancer_mp.distribution);

  }

  calculateHypotheticalBaseDistributionArray(){

    du.debug('Calculate Hypothetical Base Distribution Array');

    let merchantproviders = this.parameters.get('merchantproviders');

    let hypothetical_distribution_base_array = arrayutilities.map(merchantproviders, (merchantprovider) => {
      return this.getMerchantProviderHypotheticalBaseDistribution(merchantprovider);
    });

    return Promise.all(hypothetical_distribution_base_array)
    .then(hypothetical_distribution_base_array => {

      this.parameters.set('hypothetical_distribution_base_array', hypothetical_distribution_base_array);

      return hypothetical_distribution_base_array;

    });

  }

  selectMerchantProviderFromLSS(){

    du.debug('Select Merchant Provider From LSS');

    let hypothetical_distribution_base_array = this.parameters.get('hypothetical_distribution_base_array');
    let target_distribution_array = this.parameters.get('target_distribution_array');
    let merchantproviders = this.parameters.get('merchantproviders');
    let amount = this.parameters.get('amount');
    let index = 0;
    let lss = null;
    let selected_merchantprovider = null;

    if(!_.isArray(hypothetical_distribution_base_array)){
      eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes hypothetical_distribution_base_array is an array');
    }

    if(!_.isArray(target_distribution_array)){
      eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes target_distribution_array is an array');
    }

    //Technical Debt:  This looks like it needs to be a more testable function
    arrayutilities.map(merchantproviders, (merchantprovider) => {

      let hypothetical_distribution_base_array_clone = hypothetical_distribution_base_array;

      hypothetical_distribution_base_array_clone[index] += this.getMerchantProviderHypotheticalBaseDistribution(merchantprovider, amount);

      let ss = mathutilities.calculateLSS(target_distribution_array, hypothetical_distribution_base_array_clone);

      if(_.isNull(lss) || _.isNull(selected_merchantprovider) || ss < lss){

        lss = ss;

        selected_merchantprovider = merchantprovider;

      }

      index++;

    });

    return Promise.resolve(selected_merchantprovider);

  }

}
