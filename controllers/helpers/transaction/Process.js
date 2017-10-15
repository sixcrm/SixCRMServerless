'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

//Technical Debt:  Look at disabling and enabling ACLs here...
//Technical Debt: Use setters and getters of a parameters object.
module.exports = class Process{

    constructor(){

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

      this.parameters = {};

      this.productScheduleController = global.SixCRM.routes.include('entities','ProductSchedule.js');

      this.loadBalancerController = global.SixCRM.routes.include('entities','LoadBalancer.js');

      this.customerController = global.SixCRM.routes.include('entities','Customer.js');

      this.creditCardController = global.SixCRM.routes.include('entities','CreditCard.js');

      this.analyticsController = global.SixCRM.routes.include('analytics', 'Analytics.js');

    }

    process(parameters){

      du.debug('Process');

      return this.setParameters(parameters)
      .then(() => this.hydrateParameters())
      .then(() => this.validateParameters())
      .then(() => this.hydrateCreditCards())
      .then(() => this.selectCustomerCreditCard())
      .then(() => this.setBINNumber())
      .then(() => this.getSelectedCreditCardProperties())
      .then(() => this.selectMerchantProvider())
      .then(() => this.processTransaction())
      .then((response) => this.respond(response));

    }

    selectMerchantProvider(){

      du.debug('Select Merchant Provider');

      return this.getLoadBalancer()
      .then(() => this.getMerchantProviders())
      .then(() => this.getMerchantProviderSummaries())
      .then(() => this.marryMerchantProviderSummaries())
      .then(() => this.filterMerchantProviders())
      .then(() => this.selectMerchantProviderWithDistributionLeastSumOfSquares())
      .then((merchantprovider) => {

        this.parameters.selected_merchantprovider = merchantprovider;

        return merchantprovider;

      });

    }

    filterMerchantProviders(){

      du.debug('Filter Merchant Providers');

      return this.filterInvalidMerchantProviders(this.parameters.merchantproviders)
      .then((merchant_providers) => this.filterDisabledMerchantProviders(merchant_providers))
      .then((merchantproviders) => this.filterTypeMismatchedMerchantProviders(merchantproviders))
      .then((merchantproviders) => this.filterCAPShortageMerchantProviders(merchantproviders))
      .then((merchantproviders) => this.filterCountShortageMerchantProviders(merchantproviders))
      .then((merchantproviders) => {
        this.merchantproviders = merchantproviders
        return merchantproviders;
      });

    }

    selectMerchantProviderWithDistributionLeastSumOfSquares(){

      if(arrayutilities.nonEmpty(this.parameters.merchantproviders)){

        if(this.parameters.merchantproviders.length == 1){

          return Promise.resolve(this.parameters.merchantproviders.shift());

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

      return this.validateSelectedMerchantProvider()
      .then(() => this.instantiateGateway())
      .then(() => this.createProcessingParameters())
      .then(processing_parameters => {
        return this.parameters.instantiated_gateway.process(processing_parameters);
      })
      .then(response => {
        response.merchant_provider = this.parameters.selected_merchantprovider.id;
        return response;
      });

    }

    //Technical Debt: Untested.
    validateSelectedMerchantProvider(){

      du.debug('Validate Selected Merchant Provider');

      mvu.validateModel(this.parameters.selected_merchantprovider, global.SixCRM.routes.path('model','transaction/merchantprovider.json'));

      return Promise.resolve(true);

    }

    respond(response){

      du.debug(response);

      return response;

    }

    setParameters(parameters){

      du.debug('Set Parameters');

      this.parameters = objectutilities.transcribe(this.parameter_definitions.required, parameters, this.parameters, true);

      this.parameters = objectutilities.transcribe(this.parameter_definitions.optional, parameters, this.parameters, false);

      return Promise.resolve(true);

    }

    hydrateParameters(){

      du.debug('Hydrate Parameters');

      let promises = [];

      let customer_id = this.customerController.getID(this.parameters.customer);
      let productschedule_id = this.productScheduleController.getID(this.parameters.productschedule);

      this.customerController.disableACLs();
      promises.push(this.customerController.get({id: customer_id}));
      promises.push(this.productScheduleController.get({id: productschedule_id}));
      this.customerController.enableACLs();

      return Promise.all(promises).then((promises) => {

        this.parameters.customer = promises[0];

        this.parameters.productschedule = promises[1];

        return promises;

      });

    }

    validateParameters(){

      du.debug('Validate Parameters');
      //Technical Debt:  This should just be a big object that gets validated once...

      objectutilities.map(this.parameter_definitions.required, (required_parameter) => {

        mvu.validateModel(this.parameters[required_parameter], global.SixCRM.routes.path('model','transaction/'+required_parameter+'.json'));

      });

      return true;

    }

    //Technical Debt:  Use a bulk query method (IN)
    hydrateCreditCards(){

      du.debug('Hydrate Credit Cards');

      this.creditCardController.disableACLs();

      let promises = arrayutilities.map(this.parameters.customer.creditcards, (creditcard) => {

        return this.creditCardController.get({id: this.creditCardController.getID(creditcard)});

      });

      this.creditCardController.enableACLs();

      return Promise.all(promises).then((promises) => {

        this.parameters.customer.creditcards = promises;

        return true;

      });

    }

    selectCustomerCreditCard(){

      du.debug('Select Customer Credit Card');

      let selected_credit_card = null;

      arrayutilities.map(this.parameters.customer.creditcards, (credit_card) => {

        let valid_card = mvu.validateModel(credit_card, global.SixCRM.routes.path('model','transaction/creditcard.json'), null, false);

        if(valid_card){

          if(_.has(credit_card, 'default') && credit_card.default == true){

            selected_credit_card = credit_card;

          }else if(_.isNull(selected_credit_card)){

            selected_credit_card = credit_card;

          }else if(!_.has(selected_credit_card, 'default') && credit_card.updated_at > selected_credit_card.updated_at){

            selected_credit_card = credit_card;

          }

        }else{

          du.warning('Invalid Credit Card: '+credit_card);

        }

      });

      if(_.isNull(selected_credit_card)){
        eu.throwError('server', 'Unable to set credit card for customer');
      }

      this.parameters.selected_credit_card = selected_credit_card;

      return Promise.resolve(this.parameters.selected_credit_card);

    }

    setBINNumber(){

      du.debug('Set BIN Number');

      if(!objectutilities.hasRecursive(this, 'parameters.selected_credit_card.number')){
        eu.throwError('server', 'Unable to identify selected credit card.');
      }

      let binnumber = this.creditCardController.getBINNumber(this.parameters.selected_credit_card.number);

      if(_.isNull(binnumber)){

        eu.throwError('server', 'Unable to determine BIN Number.');

      }

      this.parameters.selected_credit_card.bin = binnumber;

      return Promise.resolve(binnumber);

    }

    getSelectedCreditCardProperties(){

      du.debug('Get Selected Credit Card Properties');

      if(!objectutilities.hasRecursive(this, 'parameters.selected_credit_card.bin')){
        eu.throwError('server', 'Process.getSelectedCreditCardProperties assumes selected_credit_card property with a associated BIN');
      }

      let analytics_parameters = {binfilter: {binnumber:[parseInt(this.parameters.selected_credit_card.bin)]}};

      return this.analyticsController.getBINList(analytics_parameters).then((properties) => {

        if(_.isNull(properties)){
          eu.throwError('not_found', 'Unable to identify credit card properties.');
        }

        if(_.has(properties, 'bins') && arrayutilities.nonEmpty(properties.bins)){

          this.parameters.selected_credit_card.properties = properties.bins[0];

          return properties[0];

        }

        return null;

      });

    }

    validateProcessClass(process_stage){

      du.debug('Validate Process Class');

      if(process_stage == 'pre'){

        mvu.validateModel(this, global.SixCRM.routes.path('model','transaction/process_class_pre.json'));

      }else if(process_stage == 'post'){

        mvu.validateModel(this, global.SixCRM.routes.path('model','transaction/process_class_post.json'));

      }

    }

    calculateLoadBalancerSum(){

      du.debug('Calculate Loadbalancer Sum');

      if(!objectutilities.hasRecursive(this, 'parameters.selected_loadbalancer.merchantproviders')){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes the selected_loadbalancer property is set and has property "merchantproviders"');
      }

      if(!arrayutilities.nonEmpty(this.parameters.selected_loadbalancer.merchantproviders)){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes the selected_loadbalancer.merchantproviders property is a non-empty array.');
      }

      let sum_array = arrayutilities.map(this.parameters.selected_loadbalancer.merchantproviders, lb_merchantprovider => {

        let merchantprovider = arrayutilities.find(this.parameters.merchantproviders, (merchantprovider => {
          return (merchantprovider.id == lb_merchantprovider.id);
        }));

        if(objectutilities.hasRecursive(merchantprovider, 'summary.summary.thismonth.amount')){
          return merchantprovider.summary.summary.thismonth.amount;
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

      this.parameters.selected_loadbalancer.monthly_sum = sum;

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

      if(!objectutilities.hasRecursive(this, 'parameters.amount') || !_.isNumber(this.parameters.amount)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that amount property is set and numeric');
      }


      if(!objectutilities.hasRecursive(this, 'parameters.selected_loadbalancer.monthly_sum') || !_.isNumber(this.parameters.selected_loadbalancer.monthly_sum)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that selected_loadbalancer.monthly_sum property is set and numeric');
      }

      if(!objectutilities.hasRecursive(merchantprovider, 'summary.summary.thismonth.amount') || !_.isNumber(merchantprovider.summary.summary.thismonth.amount)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth.amount property is numeric');
      }

      let numerator = (merchantprovider.summary.summary.thismonth.amount + additional_amount);
      let denominator = (this.parameters.selected_loadbalancer.monthly_sum + this.parameters.amount);
      let percentage = mathutilities.safePercentage(numerator, denominator, 8);

      return (percentage/100);

    }

    getMerchantProviderTargetDistribution(merchantprovider){

      if(!objectutilities.hasRecursive(this, 'parameters.selected_loadbalancer.merchantproviders')){
        eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer.merchantproviders property is set');
      }

      if(!arrayutilities.nonEmpty(this.parameters.selected_loadbalancer.merchantproviders)){
        eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer.merchantproviders an array and has length greater than 0');
      }

      let loadbalancer_mp = arrayutilities.find(this.parameters.selected_loadbalancer.merchantproviders, (lb_mp) => {
        return (lb_mp.id == merchantprovider.id);
      });

      if(!_.has(loadbalancer_mp, 'id') || !_.has(loadbalancer_mp, 'distribution')){
        eu.throwError('server','Process.getMerchantProviderTarget is unable to determine the merchant_provider');
      }

      return Promise.resolve(loadbalancer_mp.distribution);

    }

    calculateDistributionTargetsArray(){

      du.debug('Calculate Distribution Targets Array');

      let distribution_targets_array = arrayutilities.map(this.parameters.merchantproviders, (merchantprovider) => {

        try {
          return this.getMerchantProviderTargetDistribution(merchantprovider);
        }catch(e){
          return e;
        }

      });

      return Promise.all(distribution_targets_array).then(distribution_targets_array => {

        this.parameters.target_distribution_array = distribution_targets_array;

        return distribution_targets_array;

      });

    }

    calculateHypotheticalBaseDistributionArray(){

      du.debug('Calculate Hypothetical Base Distribution Array');

      return new Promise((resolve, reject) => {

        let hypothetical_distribution_base_array = arrayutilities.map(this.parameters.merchantproviders, (merchantprovider) => {

          try{

            return this.getMerchantProviderHypotheticalBaseDistribution(merchantprovider);

          }catch(e){

            return e;

          }

        });

        return Promise.all(hypothetical_distribution_base_array).then(hypothetical_distribution_base_array => {

          this.parameters.hypothetical_distribution_base_array = hypothetical_distribution_base_array;

          return resolve(hypothetical_distribution_base_array);

        //Technical Debt: Catch is unprecedented here...
        }).catch(error => {

          return reject(error);

        });

      });

    }

    selectMerchantProviderFromLSS(){

      du.debug('Select Merchant Provider From LSS');

      if(!objectutilities.hasRecursive(this, 'parameters.hypothetical_distribution_base_array')){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes hypothetical_distribution_base_array is set');
      }

      if(!_.isArray(this.parameters.hypothetical_distribution_base_array)){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes hypothetical_distribution_base_array is an array');
      }

      if(!objectutilities.hasRecursive(this, 'parameters.target_distribution_array')){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes target_distribution_array is set');
      }

      if(!_.isArray(this.parameters.target_distribution_array)){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes target_distribution_array is an array');
      }

      let lss = null;
      let index = 0;
      let selected_merchantprovider = null;

      arrayutilities.map(this.parameters.merchantproviders, (merchantprovider) => {

        let hypothetical_distribution_base_array_clone = this.parameters.hypothetical_distribution_base_array;

        hypothetical_distribution_base_array_clone[index] += this.getMerchantProviderHypotheticalBaseDistribution(merchantprovider, this.parameters.amount);

        let ss = mathutilities.calculateLSS(this.parameters.target_distribution_array, hypothetical_distribution_base_array_clone);

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

      return this.productScheduleController.getLoadBalancer(this.parameters.productschedule).then((loadbalancer) => {

        this.parameters.selected_loadbalancer = loadbalancer;

        return loadbalancer;

      });

    }

    getMerchantProviders(){

      du.debug('Get Merchant Providers');

      if(!objectutilities.hasRecursive(this, 'parameters.selected_loadbalancer')){
        eu.throwError('server', 'A load balancer must be selected before selecting merchant providers.');
      }

      this.loadBalancerController.disableACLs();
      return this.loadBalancerController.getMerchantProviders(this.parameters.selected_loadbalancer).then((merchantproviders) => {
        this.loadBalancerController.enableACLs();

        this.parameters.merchantproviders = merchantproviders;

        return merchantproviders;

      });

    }

    getMerchantProviderSummaries(){

      du.debug('Get Merchant Provider Summaries');

      let merchantprovider_ids = arrayutilities.map(this.parameters.merchantproviders, merchantprovider => {
        return merchantprovider.id;
      });

      let parameters = {analyticsfilter:{merchantprovider: merchantprovider_ids}};

      this.analyticsController.disableACLs();
      return this.analyticsController.getMerchantProviderSummaries(parameters).then(results => {
        this.analyticsController.enableACLs();

        this.parameters.merchantprovider_summaries = results.merchantproviders;

        return results;

      });

    }

    marryMerchantProviderSummaries(){

      du.debug('Marry Merchant Provider Summaries');

      arrayutilities.map(this.parameters.merchantprovider_summaries, (summary) => {

        arrayutilities.filter(this.parameters.merchantproviders, (merchantprovider, index) => {

          if(merchantprovider.id == summary.merchantprovider.id){
            this.parameters.merchantproviders[index].summary = summary;
          }

        });

      });

      return Promise.resolve(this.parameters.merchantproviders);

    }

    filterInvalidMerchantProviders(merchant_providers){

      du.debug('Filter Invalid Merchant Providers');

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        return mvu.validateModel(merchant_provider, global.SixCRM.routes.path('model','transaction/merchantprovider.json'), null, false);

      });

      return Promise.resolve(return_array);

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

      if(!objectutilities.hasRecursive(this, 'parameters.selected_credit_card.properties.brand')){
        eu.throwError('server', 'Process.filterTypeMismatchedMerchantProviders assumes selected_credit_card.properties.brand property');
      }

      let cleanstring = (a_string) => {
        return stringutilities.removeWhitespace(a_string).toLowerCase();
      }

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        if(!_.has(merchant_provider, 'accepted_payment_methods')){
          eu.throwError('server', 'Merchant Provider does not have the "accepted_payment_methods" property.');
        }

        if(!_.isArray(merchant_provider.accepted_payment_methods)){
          eu.throwError('server', 'Merchant Provider "accepted_payment_methods" is not an array.');
        }

        let accepted_payment_methods_array = merchant_provider.accepted_payment_methods.map((accepted_payment_method) => {
          return cleanstring(accepted_payment_method);
        });

        return _.contains(accepted_payment_methods_array, cleanstring(this.parameters.selected_credit_card.properties.brand));

      });

      return Promise.resolve(return_array);

    }

    filterCAPShortageMerchantProviders(merchant_providers){

      du.debug('Filter CAP Shortage Merchant Providers');

      let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

        let proposed_total = (parseFloat(merchant_provider.summary.summary.thismonth.amount) + parseFloat(this.parameters.amount));
        let cap = parseFloat(merchant_provider.processing.monthly_cap);

        return !(proposed_total >= cap);

      });

      return Promise.resolve(return_array);

    }

    filterCountShortageMerchantProviders(merchant_providers){

      du.debug('Filter Count Shortage Merchant Providers');

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

      let gateway = null;

      du.warning(this.parameters);

      let GatewayController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/'+this.parameters.selected_merchantprovider.gateway.name+'/handler.js');

      gateway = new GatewayController(this.parameters.selected_merchantprovider.gateway);

      this.parameters.instantiated_gateway = gateway;

      return Promise.resolve(gateway);

    }

    createProcessingParameters(){

      du.debug('Create Processing Parameters');

      if(!objectutilities.hasRecursive(this, 'parameters.customer')){
        eu.throwError('server', 'Process.createProcessingParameters assumes customer property');
      }

      if(!objectutilities.hasRecursive(this, 'parameters.selected_credit_card')){
        eu.throwError('server', 'Process.createProcessingParameters assumes selected_credit_card property');
      }

      if(!objectutilities.hasRecursive(this, 'parameters.amount')){
        eu.throwError('server', 'Process.createProcessingParameters assumes amount property');
      }

      let parameters = {customer: this.parameters.customer, creditcard: this.parameters.selected_credit_card, amount: this.parameters.amount};

      return Promise.resolve(parameters);

    }

}
