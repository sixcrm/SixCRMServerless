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
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');

//Technical Debt:  Look at disabling and enabling ACLs here...
module.exports = class Process extends TransactionUtilities{

    constructor(){

      super();

      this.parameter_definitions = {
        required:{
          customer:'customer',
          productschedule:'productschedule',
          amount:'amount'
        },
        optional:{
          merchantprovider:'merchantprovider'
        }
      };

      this.parameter_validation = {
        'process': global.SixCRM.routes.path('model','transaction/process.json'),
        'selected_merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
        'creditcard': global.SixCRM.routes.path('model','transaction/creditcard.json'),
        'selected_creditcard': global.SixCRM.routes.path('model','transaction/creditcard.json'),
        'customer': global.SixCRM.routes.path('model','transaction/customer.json'),
        'productschedule': global.SixCRM.routes.path('model','transaction/productschedule.json'),
        'merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
        'merchantproviders': global.SixCRM.routes.path('model','transaction/merchantproviders.json'),
        'amount':global.SixCRM.routes.path('model','transaction/amount.json'),
        'loadbalancer': global.SixCRM.routes.path('model','transaction/loadbalancer.json'),
        'selected_loadbalancer': global.SixCRM.routes.path('model','transaction/loadbalancer.json'),
        'target_distribution_array': global.SixCRM.routes.path('model', 'transaction/target_distribution_array.json'),
        'hypothetical_distribution_base_array': global.SixCRM.routes.path('model', 'transaction/hypothetical_distribution_base_array.json'),
        'merchantprovider_summaries':global.SixCRM.routes.path('model', 'transaction/merchantprovider_summaries.json')
      };

      this.productScheduleController = global.SixCRM.routes.include('entities','ProductSchedule.js');

      this.loadBalancerController = global.SixCRM.routes.include('entities','LoadBalancer.js');

      this.customerController = global.SixCRM.routes.include('entities','Customer.js');

      this.creditCardController = global.SixCRM.routes.include('entities','CreditCard.js');

      this.analyticsController = global.SixCRM.routes.include('analytics', 'Analytics.js');

      this.instantiateParameters();

    }

    process(parameters){

      du.debug('Process');

      return this.setParameters(parameters)
      .then(() => this.hydrateParameters())
      .then(() => this.hydrateCreditCards())
      .then(() => this.selectCustomerCreditCard())
      .then(() => this.setBINNumber())
      .then(() => this.getSelectedCreditCardProperties())
      .then(() => this.selectMerchantProvider())
      .then(() => this.processTransaction());

    }

    selectMerchantProvider(){

      du.debug('Select Merchant Provider');

      let merchant_provider = this.parameters.get('merchantprovider', null, false);

      if(!_.isNull(merchant_provider)){

        return this.hydrateMerchantProvider()
        .then(() => this.setMerchantProviders())
        .then(() => this.getMerchantProviderSummaries())
        .then(() => this.marryMerchantProviderSummaries())
        .then(() => this.filterMerchantProviders())
        .then(() => this.selectMerchantProviderWithDistributionLeastSumOfSquares())
        .then((merchantprovider) => {

          this.parameters.set('selected_merchantprovider', merchantprovider);

          return merchantprovider;

        });

      }

      return this.getLoadBalancer()
      .then(() => this.getMerchantProviders())
      .then(() => this.getMerchantProviderSummaries())
      .then(() => this.marryMerchantProviderSummaries())
      .then(() => this.filterMerchantProviders())
      .then(() => this.selectMerchantProviderWithDistributionLeastSumOfSquares())
      .then((merchantprovider) => {

        this.parameters.set('selected_merchantprovider', merchantprovider);

        return merchantprovider;

      });

    }

    hydrateMerchantProvider(){

      du.debug('Hydrate Merchant Provider');

      let merchant_provider = this.parameters.get('merchantprovider');

      let id = this.merchantProviderController.getID(merchant_provider);

      return this.merchantProviderController.get({id:id}).then(merchant_provider => {

        this.parameters.set('merchantprovider', merchant_provider);

      });

    }

    filterMerchantProviders(){

      du.debug('Filter Merchant Providers');

      let merchant_providers = this.parameters.get('merchantproviders');

      return this.filterInvalidMerchantProviders(merchant_providers)
      .then((merchant_providers) => this.filterDisabledMerchantProviders(merchant_providers))
      .then((merchantproviders) => this.filterTypeMismatchedMerchantProviders(merchantproviders))
      .then((merchantproviders) => this.filterCAPShortageMerchantProviders(merchantproviders))
      .then((merchantproviders) => this.filterCountShortageMerchantProviders(merchantproviders))
      .then((merchantproviders) => {
        this.parameters.set('merchantproviders', merchantproviders);
        return merchantproviders;
      });

    }

    selectMerchantProviderWithDistributionLeastSumOfSquares(){

      let merchantproviders = this.parameters.get('merchantproviders');

      if(arrayutilities.nonEmpty(merchantproviders)){

        if(merchantproviders.length == 1){

          return Promise.resolve(merchantproviders.shift());

        }else{

          return this.calculateLoadBalancerSum()
          .then(() => this.calculateDistributionTargetsArray())
          .then(() => this.calculateHypotheticalBaseDistributionArray())
          .then(() => this.selectMerchantProviderFromLSS());

        }

      }

      return Promise.resolve(null);

    }

    //Technical Debt:  Untested
    processTransaction(){

      du.debug('Process Transaction');

      return this.instantiateGateway()
      .then(() => this.createProcessingParameters())
      .then(() => {

        let processing_parameters = this.parameters.get('process');
        let instantiated_gateway = this.parameters.get('instantiated_gateway');

        return instantiated_gateway.process(processing_parameters);

      })
      .then(response => {

        let selected_merchantprovider = this.parameters.get('selected_merchantprovider')

        response.merchant_provider = selected_merchantprovider.id;
        return response;

      });

    }

    hydrateParameters(){

      du.debug('Hydrate Parameters');

      let promises = [];

      let customer = this.parameters.get('customer');
      let productschedule = this.parameters.get('productschedule');

      let customer_id = this.customerController.getID(customer);
      let productschedule_id = this.productScheduleController.getID(productschedule);

      this.customerController.disableACLs();
      promises.push(this.customerController.get({id: customer_id}));
      promises.push(this.productScheduleController.get({id: productschedule_id}));
      this.customerController.enableACLs();

      return Promise.all(promises).then((promises) => {

        this.parameters.set('customer', promises[0]);

        this.parameters.set('productschedule', promises[1]);

        return promises;

      });

    }

    //Technical Debt:  Use a bulk query method (IN)
    hydrateCreditCards(){

      du.debug('Hydrate Credit Cards');

      let customer = this.parameters.get('customer', ['creditcards']);

      this.creditCardController.disableACLs();
      let promises = arrayutilities.map(customer.creditcards, (creditcard) => {
        return this.creditCardController.get({id: this.creditCardController.getID(creditcard)});
      });

      this.creditCardController.enableACLs();


      return Promise.all(promises).then((promises) => {

        customer.creditcards = promises;

        this.parameters.set('customer', customer);

        return true;

      });

    }

    selectCustomerCreditCard(){

      du.debug('Select Customer Credit Card');

      let selected_creditcard = null;

      let creditcards = this.parameters.get('customer', ['creditcards']).creditcards;

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

      this.parameters.set('selected_creditcard', selected_creditcard);

      return Promise.resolve(selected_creditcard);

    }

    setBINNumber(){

      du.debug('Set BIN Number');

      let selected_creditcard = this.parameters.get('selected_creditcard');

      let binnumber = this.creditCardController.getBINNumber(selected_creditcard.number);

      if(_.isNull(binnumber)){

        eu.throwError('server', 'Unable to determine BIN Number.');

      }

      selected_creditcard.bin = binnumber;

      this.parameters.set('selected_creditcard', selected_creditcard);

      return Promise.resolve(binnumber);

    }

    getSelectedCreditCardProperties(){

      du.debug('Get Selected Credit Card Properties');

      let selected_creditcard = this.parameters.get('selected_creditcard', ['bin']);

      let analytics_parameters = {binfilter: {binnumber:[parseInt(selected_creditcard.bin)]}};

      return this.analyticsController.getBINList(analytics_parameters).then((properties) => {

        if(_.isNull(properties)){
          eu.throwError('not_found', 'Unable to identify credit card properties.');
        }

        if(_.has(properties, 'bins') && arrayutilities.nonEmpty(properties.bins)){

          selected_creditcard.properties = properties.bins[0];

          this.parameters.set('selected_creditcard', selected_creditcard);

          return properties[0];

        }

        return null;

      });

    }

    /*
    validateProcessClass(process_stage){

      du.debug('Validate Process Class');

      if(process_stage == 'pre'){

        mvu.validateModel(this, global.SixCRM.routes.path('model','transaction/process_class_pre.json'));

      }else if(process_stage == 'post'){

        mvu.validateModel(this, global.SixCRM.routes.path('model','transaction/process_class_post.json'));

      }

    }
    */

    //Technical Debt: This is kinda messy
    calculateLoadBalancerSum(){

      du.debug('Calculate Loadbalancer Sum');

      let selected_loadbalancer = this.parameters.get('selected_loadbalancer', ['merchantproviders']);
      let merchantproviders = this.parameters.get('merchantproviders');

      if(!arrayutilities.nonEmpty(selected_loadbalancer.merchantproviders)){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes the selected_loadbalancer.merchantproviders property is a non-empty array.');
      }

      let sum_array = arrayutilities.map(selected_loadbalancer.merchantproviders, lb_merchantprovider => {

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

    getMerchantProviderHypotheticalBaseDistribution(merchantprovider, additional_amount){

      du.debug('Get Merchant Provider Hypothetical Base Distribution');

      if(_.isUndefined(additional_amount)){
        additional_amount = 0;
      }

      if(!_.isNumber(additional_amount)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that additional_amount argument is numeric');
      }

      let amount = this.parameters.get('amount');
      let selected_loadbalancer = this.parameters.get('selected_loadbalancer', ['monthly_sum']);


      if(!_.isNumber(selected_loadbalancer.monthly_sum)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that selected_loadbalancer.monthly_sum property is numeric');
      }

      if(!objectutilities.hasRecursive(merchantprovider, 'summary.summary.thismonth.amount')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth.amount property is set');
      }

      if(!numberutilities.isNumber(merchantprovider.summary.summary.thismonth.amount)){
        if(_.isString(merchantprovider.summary.summary.thismonth.amount) && stringutilities.isNumeric(merchantprovider.summary.summary.thismonth.amount)){
          merchantprovider.summary.summary.thismonth.amount = parseFloat(merchantprovider.summary.summary.thismonth.amount);
        }else{
          eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth.amount property is numeric');
        }
      }

      let numerator = (merchantprovider.summary.summary.thismonth.amount + additional_amount);
      let denominator = (selected_loadbalancer.monthly_sum + amount);
      let percentage = mathutilities.safePercentage(numerator, denominator, 8);

      return (percentage/100);

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

    getLoadBalancer(){

      du.debug('Get Loadbalancer');

      let productschedule = this.parameters.get('productschedule');

      return this.productScheduleController.getLoadBalancer(productschedule).then((loadbalancer) => {

        this.parameters.set('selected_loadbalancer', loadbalancer);

        return loadbalancer;

      });

    }

    getMerchantProviders(){

      du.debug('Get Merchant Providers');

      let selected_loadbalancer = this.parameters.get('selected_loadbalancer');

      this.loadBalancerController.disableACLs();
      return this.loadBalancerController.getMerchantProviders(selected_loadbalancer).then((merchantproviders) => {
        this.loadBalancerController.enableACLs();

        this.parameters.set('merchantproviders', merchantproviders);

        return merchantproviders;

      });

    }

    getMerchantProviderSummaries(){

      du.debug('Get Merchant Provider Summaries');

      let merchantproviders = this.parameters.get('merchantproviders');

      let merchantprovider_ids = arrayutilities.map(merchantproviders, merchantprovider => {
        return merchantprovider.id;
      });

      let parameters = {analyticsfilter:{merchantprovider: merchantprovider_ids}};

      this.analyticsController.disableACLs();
      return this.analyticsController.getMerchantProviderSummaries(parameters).then(results => {
        this.analyticsController.enableACLs();

        this.parameters.set('merchantprovider_summaries', results.merchantproviders);

        return results;

      });

    }

    marryMerchantProviderSummaries(){

      du.debug('Marry Merchant Provider Summaries');

      let merchantprovider_summaries = this.parameters.get('merchantprovider_summaries');
      let merchantproviders = this.parameters.get('merchantproviders');

      arrayutilities.map(merchantprovider_summaries, (summary) => {

        arrayutilities.filter(merchantproviders, (merchantprovider, index) => {

          if(merchantprovider.id == summary.merchantprovider.id){
            merchantproviders[index].summary = summary;
          }

        });

      });

      this.parameters.set('merchantproviders', merchantproviders);

      return Promise.resolve(merchantproviders);

    }

    filterInvalidMerchantProviders(merchant_providers){

      du.debug('Filter Invalid Merchant Providers');

      if(!arrayutilities.nonEmpty(merchant_providers)){
        eu.throwError('server', 'No merchant providers to select from.');
      }

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        return (_.has(merchant_provider, 'summary'));

      });

      return Promise.resolve(return_array);

    }

    filterDisabledMerchantProviders(merchant_providers){

      du.debug('Filter Disabled Merchant Providers');

      if(!arrayutilities.nonEmpty(merchant_providers)){
        eu.throwError('server', 'No merchant providers to select from.');
      }

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {
        return (merchant_provider.enabled == true);
      });

      return Promise.resolve(return_array);

    }

    filterTypeMismatchedMerchantProviders(merchant_providers){

      du.debug('Filter Type Mismatched Merchant Providers');

      if(!arrayutilities.nonEmpty(merchant_providers)){
        eu.throwError('server', 'No merchant providers to select from.');
      }

      let selected_creditcard = this.parameters.get('selected_creditcard', ['properties.brand']);

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        let accepted_payment_methods_array = arrayutilities.map(merchant_provider.accepted_payment_methods, (accepted_payment_method) => {
          return this.makeGeneralBrandString(accepted_payment_method);
        });

        return _.contains(accepted_payment_methods_array, this.makeGeneralBrandString(selected_creditcard.properties.brand));

      });

      return Promise.resolve(return_array);

    }

    filterCAPShortageMerchantProviders(merchant_providers){

      du.debug('Filter CAP Shortage Merchant Providers');

      if(!arrayutilities.nonEmpty(merchant_providers)){
        eu.throwError('server', 'No merchant providers to select from.');
      }

      let amount = this.parameters.get('amount');
      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        //Technical Debt:  Lets abstract this to a different function
        let proposed_total = (parseFloat(merchant_provider.summary.summary.thismonth.amount) + parseFloat(amount));
        let cap = parseFloat(merchant_provider.processing.monthly_cap);

        return !(proposed_total >= cap);

      });

      return Promise.resolve(return_array);

    }

    filterCountShortageMerchantProviders(merchant_providers){

      du.debug('Filter Count Shortage Merchant Providers');

      if(!arrayutilities.nonEmpty(merchant_providers)){
        eu.throwError('server', 'No merchant providers to select from.');
      }

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        if(parseInt(merchant_provider.summary.summary.today.count) >= parseInt(merchant_provider.processing.transaction_counts.daily)){
          du.warning('Daily Count Shortage');
          return false;
        }

        if(parseInt(merchant_provider.summary.summary.thisweek.count) >= parseInt(merchant_provider.processing.transaction_counts.weekly)){
          du.warning('Weekly Count Shortage');
          return false;
        }

        if(parseInt(merchant_provider.summary.summary.thismonth.count) >= parseInt(merchant_provider.processing.transaction_counts.monthly)){
          du.warning('Monthly Count Shortage');
          return false;
        }

        return true;

      });

      return Promise.resolve(return_array);

    }

    instantiateGateway(){

      du.debug('Instantiate Gateway');

      let selected_merchantprovider = this.parameters.get('selected_merchantprovider', ['gateway.name']);

      const GatewayController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/'+selected_merchantprovider.gateway.name+'/handler.js');

      let gateway = new GatewayController(selected_merchantprovider.gateway);

      this.parameters.set('instantiated_gateway', gateway);

      return Promise.resolve(gateway);

    }

    createProcessingParameters(){

      du.debug('Create Processing Parameters');

      let customer = this.parameters.get('customer');
      let selected_creditcard = this.parameters.get('selected_creditcard');
      let amount = this.parameters.get('amount');

      let parameters = {
        customer: customer,
        creditcard: selected_creditcard,
        amount: amount
      };

      this.parameters.set('process', parameters);

      return Promise.resolve(parameters);

    }

}

class Parameters {

  constructor(){
    this.store = {};
    this.validation = {
      'selected_merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
      'creditcard': global.SixCRM.routes.path('model','transaction/creditcard.json'),
      'selected_creditcard': global.SixCRM.routes.path('model','transaction/creditcard.json'),
      'customer': global.SixCRM.routes.path('model','transaction/customer.json'),
      'productschedule': global.SixCRM.routes.path('model','transaction/productschedule.json'),
      'merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
      'merchantproviders': global.SixCRM.routes.path('model','transaction/merchantproviders.json'),
      'amount':global.SixCRM.routes.path('model','transaction/amount.json'),
      'loadbalancer': global.SixCRM.routes.path('model','transaction/loadbalancer.json'),
      'selected_loadbalancer': global.SixCRM.routes.path('model','transaction/loadbalancer.json'),
      'target_distribution_array': global.SixCRM.routes.path('model', 'transaction/target_distribution_array.json'),
      'hypothetical_distribution_base_array': global.SixCRM.routes.path('model', 'transaction/hypothetical_distribution_base_array.json'),
      'merchantprovider_summaries':global.SixCRM.routes.path('model', 'transaction/merchantprovider_summaries.json')
    };
  }

  set(key, value){

    du.debug('Set');

    if(this.validate(key, value)){

      this.store[key] = value;

    }

  }

  get(key, additional_parameters, fatal){

    du.debug('Get');

    fatal = (_.isUndefined(fatal))?true:fatal;

    let return_object = null;

    if(_.has(this.store, key)){

      return_object = this.store[key];

      if(arrayutilities.nonEmpty(additional_parameters)){

        let missing_parameter = arrayutilities.find(additional_parameters, (additional_parameter) => {
          if(objectutilities.hasRecursive(return_object, additional_parameter)){
            return false;
          }
          return true;
        });

        if(stringutilities.isString(missing_parameter) && fatal){
          eu.throwError('server', key+' is missing "'+missing_parameter+'" property.');
        }

      }

    }

    if(_.isNull(return_object) && fatal){
      eu.throwError('server', '"'+key+'" property is not set.');
    }

    return return_object;

  }

  validate(key, value, fatal){

    du.debug('Validate');

    fatal = (_.isUndefined(fatal))?true:fatal;

    if(_.has(this.validation, key)){
      return mvu.validateModel(value, this.validation[key], null, fatal);
    }else{
      du.warning('Missing Model: '+ key);
    }

    return true;

  }

}
