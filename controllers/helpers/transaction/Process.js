'use strict'
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const mvu = global.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');
const mathutilities = global.routes.include('lib', 'math-utilities.js');

//Technical Debt:  Look at disabling and enabling ACLs here...

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
      .then(() => this.hydrateParameters())
      .then(() => this.validateParameters())
      .then(() => this.hydrateCreditCards())
      .then(() => this.selectCustomerCreditCard())
      .then(() => this.setBINNumber())
      .then(() => this.getSelectedCreditCardProperties())
      //.then(() => this.validateProcessClass('pre'))
      .then(() => this.selectMerchantProvider())
      .then(() => this.processTransaction())
      .then((response) => this.respond(response));

    }

    selectMerchantProvider(){

      du.debug('Select Merchant Provider');

      return this.getLoadBalancer()
      .then(() => this.selectLoadBalancer())
      .then(() => this.getMerchantProviders())
      .then(() => this.getMerchantProviderSummaries())
      .then(() => this.marryMerchantProviderSummaries())
      .then(() => this.filterMerchantProviders())
      .then(() => this.selectMerchantProviderWithDistributionLeastSumOfSquares())
      .then((merchantprovider) => {

        this.selected_merchantprovider = merchantprovider;

        return merchantprovider;

      });

    }

    filterMerchantProviders(){

      du.debug('Filter Merchant Providers');

      return this.filterInvalidMerchantProviders(this.merchantproviders)
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

      if(this.merchantproviders.length < 1){

        return Promise.resolve(null);

      }else if(this.merchantproviders.length == 1){

        return Promise.resolve(this.merchantproviders[0]);

      }else{

        return this.calculateLoadBalancerSum()
        .then(() => this.calculateDistributionTargetsArray())
        .then(() => this.calculateHypotheticalBaseDistributionArray())
        .then(() => this.selectMerchantProviderFromLSS())
        .then((merchantprovider) => {

          return merchantprovider;

        });

      }

    }

    processTransaction(){

      du.debug('Process Transaction');

      return this.instantiateGateway()
      .then(() => this.createProcessingParameters())
      .then(processing_parameters => {
        return this.instantiated_gateway.process(processing_parameters);
      })
      .then(response => {
        response.merchant_provider = this.selected_merchantprovider.id;
        return response;
      });

    }

    respond(response){

      du.debug(response);

      return response;

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

      return Promise.resolve(true);

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

        return promises;

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

      return Promise.resolve(binnumber);

    }

    getSelectedCreditCardProperties(){

      du.debug('Get Selected Credit Card Properties');

      if(!_.has(this, 'selected_credit_card')){
        eu.throwError('server', 'Process.getSelectedCreditCardProperties assumes selected_credit_card property');
      }

      if(!_.has(this.selected_credit_card, 'bin')){
        eu.throwError('server', 'Process.getSelectedCreditCardProperties assumes selected_credit_card.bin property');
      }

      let analytics_parameters = {binfilter: {binnumber:[parseInt(this.selected_credit_card.bin)]}};

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

    validateProcessClass(process_stage){

      du.debug('Validate Process Class');

      if(process_stage == 'pre'){

        mvu.validateModel(this, global.routes.path('model','transaction/process_class_pre.json'));

      }else if(process_stage == 'post'){

        mvu.validateModel(this, global.routes.path('model','transaction/process_class_post.json'));

      }

    }

    calculateLoadBalancerSum(){

      du.debug('Calculate Loadbalancer Sum');

      if(!_.has(this, 'selected_loadbalancer')){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes the selected_loadbalancer property is set');
      }

      if(!_.has(this.selected_loadbalancer, 'merchantproviders')){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes the selected_loadbalancer.merchantproviders property is set');
      }

      if(!_.isArray(this.selected_loadbalancer.merchantproviders)){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes the selected_loadbalancer.merchantproviders property is set');
      }

      let sum_array = this.selected_loadbalancer.merchantproviders.map(lb_merchantprovider => {

        let merchantprovider = arrayutilities.find(this.merchantproviders, (merchantprovider => {
          if(merchantprovider.id == lb_merchantprovider.id){
            return true;
          }
          return false;
        }));

        return merchantprovider.summary.summary.thismonth.amount;

      });

      if(sum_array.length < 1){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes a non-empty array of merchant provider sums.');
      }

      let sum = mathutilities.sum(sum_array);

      if(!_.isNumber(sum)){
        eu.throwError('server', 'Process.calculateLoadBalancerSum assumes a sum of merchant providers to be numeric.');
      }

      this.selected_loadbalancer.monthly_sum = sum;

      return Promise.resolve(sum);

    }

    getMerchantProviderHypotheticalBaseDistribution(merchantprovider, additional_amount){

      if(_.isUndefined(additional_amount)){
        additional_amount = 0;
      }

      if(!_.isNumber(additional_amount)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that additional_amount argument is numeric');
      }

      if(!_.has(this, 'amount')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that amount property is set');
      }

      if(!_.isNumber(this.amount)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that amount property is numeric');
      }

      if(!_.has(this, 'selected_loadbalancer')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that selected_loadbalancer property is set');
      }

      if(!_.has(this.selected_loadbalancer, 'monthly_sum')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that selected_loadbalancer.monthly_sum property is set');
      }

      if(!_.isNumber(this.selected_loadbalancer.monthly_sum)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that selected_loadbalancer.monthly_sum property is numeric');
      }

      if(!_.has(merchantprovider, 'summary')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary property is set');
      }

      if(!_.has(merchantprovider.summary, 'summary')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary property is set');
      }

      if(!_.has(merchantprovider.summary.summary, 'thismonth')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth property is set');
      }

      if(!_.has(merchantprovider.summary.summary.thismonth, 'amount')){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth.amount property is set');
      }

      if(!_.isNumber(merchantprovider.summary.summary.thismonth.amount)){
        eu.throwError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth.amount property is numeric');
      }

      let numerator = (merchantprovider.summary.summary.thismonth.amount + additional_amount);
      let denominator = (this.selected_loadbalancer.monthly_sum + this.amount);
      let percentage = mathutilities.safePercentage(numerator, denominator, 8);

      return (percentage/100);

    }

    getMerchantProviderTargetDistribution(merchantprovider){

      if(!_.has(this, 'selected_loadbalancer')){
        eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer property is set');
      }

      if(!_.has(this.selected_loadbalancer, 'merchantproviders')){
        eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer.merchantproviders property is set');
      }

      if(!_.isArray(this.selected_loadbalancer.merchantproviders)){
        eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer.merchantproviders property is an array');
      }

      if(this.selected_loadbalancer.merchantproviders.length < 1){
        eu.throwError('server','Process.getMerchantProviderTarget assumes that the selected_loadbalancer.merchantproviders is of length greater than 0');
      }

      let loadbalancer_mp = arrayutilities.find(this.selected_loadbalancer.merchantproviders, (lb_mp) => {
        if(lb_mp.id == merchantprovider.id){
          return true;
        }
        return false;
      });

      if(!_.has(loadbalancer_mp, 'id') || !_.has(loadbalancer_mp, 'distribution')){
        eu.throwError('server','Process.getMerchantProviderTarget is unable to determine the merchant_provider');
      }

      return Promise.resolve(loadbalancer_mp.distribution);

    }

    calculateDistributionTargetsArray(){

      let distribution_targets_array = this.merchantproviders.map((merchantprovider) => {

        try {
          return this.getMerchantProviderTargetDistribution(merchantprovider);
        }catch(e){
          return e;
        }

      });

      return Promise.all(distribution_targets_array).then(distribution_targets_array => {

        this.target_distribution_array = distribution_targets_array;

        return distribution_targets_array;

      });

    }

    calculateHypotheticalBaseDistributionArray(){

      du.debug('Calculate Hypothetical Base Distribution Array');

      return new Promise((resolve, reject) => {

        let hypothetical_distribution_base_array = this.merchantproviders.map((merchantprovider) => {

          try{

            return this.getMerchantProviderHypotheticalBaseDistribution(merchantprovider);

          }catch(e){

            return e;

          }

        });

        return Promise.all(hypothetical_distribution_base_array).then(hypothetical_distribution_base_array => {

          this.hypothetical_distribution_base_array = hypothetical_distribution_base_array;

          return resolve(hypothetical_distribution_base_array);

        }).catch(error => {

          return reject(error);

        });

      });

    }

    selectMerchantProviderFromLSS(){

      let lss = null;
      let index = 0;
      let selected_merchantprovider = null;

      if(!_.has(this, 'hypothetical_distribution_base_array')){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes hypothetical_distribution_base_array is set');
      }

      if(!_.isArray(this.hypothetical_distribution_base_array)){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes hypothetical_distribution_base_array is an array');
      }

      if(!_.has(this, 'target_distribution_array')){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes target_distribution_array is set');
      }

      if(!_.isArray(this.target_distribution_array)){
        eu.throwError('server', 'Process.selectMerchantProviderFromLSS assumes target_distribution_array is an array');
      }

      this.merchantproviders.forEach(merchantprovider => {

        let hypothetical_distribution_base_array_clone = this.hypothetical_distribution_base_array;

        hypothetical_distribution_base_array_clone[index] += this.getMerchantProviderHypotheticalBaseDistribution(merchantprovider, this.amount);

        let ss = mathutilities.calculateLSS(this.target_distribution_array, hypothetical_distribution_base_array_clone);

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

      return this.productScheduleController.getLoadBalancer(this.productschedule).then((loadbalancer) => {

        this.loadbalancer = loadbalancer;

        return loadbalancer;

      });

    }

    //Technical Debt:  Deprecated
    selectLoadBalancer(){

      du.debug('Select Load Balancer');

      if(!_.has(this, 'loadbalancer')){
        return Promise.reject(eu.getError('server','Loadbalancer must be set before selecting a loadbalancer.'));
      }

      this.selected_loadbalancer = this.loadbalancer;

      return Promise.resolve(this.selected_loadbalancer);

    }

    getMerchantProviders(){

      du.debug('Get Merchant Providers');

      if(!_.has(this, 'selected_loadbalancer')){ eu.throwError('server', 'A load balancer must be selected before selecting merchant providers.'); }

      this.loadBalancerController.disableACLs();
      return this.loadBalancerController.getMerchantProviders(this.selected_loadbalancer).then((merchantproviders) => {
        this.loadBalancerController.enableACLs();

        this.merchantproviders = merchantproviders;

        return merchantproviders;

      });

    }

    getMerchantProviderSummaries(){

      du.debug('Get Merchant Provider Summaries');

      let merchantprovider_ids = this.merchantproviders.map(merchantprovider => {
        return merchantprovider.id;
      });

      let parameters = {analyticsfilter:{merchantprovider: merchantprovider_ids}};

      this.analyticsController.disableACLs();
      return this.analyticsController.getMerchantProviderSummaries(parameters).then(results => {
        this.analyticsController.enableACLs();

        this.merchantprovider_summaries = results.merchantproviders;

        return results;

      });

    }

    marryMerchantProviderSummaries(){

      du.debug('Marry Merchant Provider Summaries');

      du.warning(this.merchantprovider_summaries);

      this.merchantprovider_summaries.forEach(summary => {

        arrayutilities.filter(this.merchantproviders, (merchantprovider, index) => {

          if(merchantprovider.id == summary.merchantprovider.id){
            this.merchantproviders[index].summary = summary;
          }

        });

      });

      return Promise.resolve(this.merchantproviders);

    }

    filterInvalidMerchantProviders(merchant_providers){

        du.debug('Filter Invalid Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

          let validation = false;

          try{

            validation = mvu.validateModel(merchant_provider, global.routes.path('model','transaction/merchantprovider.json'));

          }catch(e){

            du.warning('Invalid merchant provider: ', merchant_provider);

          }

          if(validation === true){ return true; }

          return false;

        });

        du.info(merchant_providers, return_array);

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

        du.info(merchant_providers, return_array);

        return Promise.resolve(return_array);

    }

    filterTypeMismatchedMerchantProviders(merchant_providers){

        du.debug('Filter Type Mismatched Merchant Providers');

        du.warning(this.selected_credit_card);

        if(!_.has(this, 'selected_credit_card')){
          eu.throwError('server', 'Process.filterTypeMismatchedMerchantProviders assumes selected_credit_card property');
        }

        if(!_.has(this.selected_credit_card, 'properties')){
          eu.throwError('server', 'Process.filterTypeMismatchedMerchantProviders assumes selected_credit_card.properties property');
        }

        if(!_.has(this.selected_credit_card.properties, 'brand')){
          eu.throwError('server', 'Process.filterTypeMismatchedMerchantProviders assumes selected_credit_card.properties.brand property');
        }

        let cleanstring = (a_string) => {
          return a_string.toLowerCase().replace(/\s\t\r\n/g,'');
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

          return _.contains(accepted_payment_methods_array, cleanstring(this.selected_credit_card.properties.brand));

        });

        du.info(merchant_providers, return_array);

        return Promise.resolve(return_array);

    }

    filterCAPShortageMerchantProviders(merchant_providers){

        du.debug('Filter CAP Shortage Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

          if((parseFloat(merchant_provider.summary.summary.thismonth.amount) + parseFloat(this.amount)) >= merchant_provider.processing.monthly_cap){
            return false;
          }

          return true;

        });

        du.info(merchant_providers, return_array);

        return Promise.resolve(return_array);

    }

    filterCountShortageMerchantProviders(merchant_providers){

        du.debug('Filter Count Shortage Merchant Providers');

        let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

          if(parseInt(merchant_provider.summary.summary.today.count) >= parseInt(merchant_provider.processing.transaction_counts.daily)){
            return false;
          }

          if(parseInt(merchant_provider.summary.summary.thisweek.count) >= parseInt(merchant_provider.processing.transaction_counts.weekly)){
            return false;
          }

          if(parseInt(merchant_provider.summary.summary.thismonth.count) >= parseInt(merchant_provider.processing.transaction_counts.monthly)){
            return false;
          }

          return true;

        });

        du.info(merchant_providers, return_array);

        return Promise.resolve(return_array);

    }

    instantiateGateway(){

      du.debug('Process Transaction');

      if(!_.has(this, 'selected_merchantprovider')){
        eu.throwError('server','Process.instantiateGateway assumes selected_merchantprovider property');
      }

      du.warning(this.selected_merchantprovider);

      if(!_.has(this.selected_merchantprovider, 'gateway')){
        eu.throwError('server','Process.instantiateGateway assumes selected_merchantprovider.gateway property');
      }

      if(!_.has(this.selected_merchantprovider.gateway, 'username')){
        eu.throwError('server','Process.instantiateGateway assumes selected_merchantprovider.gateway.username property');
      }

      if(!_.has(this.selected_merchantprovider.gateway, 'password')){
        eu.throwError('server','Process.instantiateGateway assumes selected_merchantprovider.gateway.password property');
      }

      if(!_.has(this.selected_merchantprovider.gateway, 'name')){
        eu.throwError('server','Process.instantiateGateway assumes selected_merchantprovider.gateway.name property');
      }

      if(!_.has(this.selected_merchantprovider.gateway, 'endpoint')){
        eu.throwError('server','Process.instantiateGateway assumes selected_merchantprovider.gateway.endpoint property');
      }

      let gateway = null;

     	if(this.selected_merchantprovider.gateway.name == "NMI"){

        var NMIController = global.routes.include('controllers', 'vendors/merchantproviders/NMI.js');

        var _nmi = new NMIController({
          username: this.selected_merchantprovider.gateway.username,
          password: this.selected_merchantprovider.gateway.password,
          endpoint: this.selected_merchantprovider.gateway.endpoint
        });

        gateway = _nmi;

      }else{

     		eu.throwError('server','Process.instantiateGateway did not recognize selected_merchantprovider.gateway.name as valid.');

     	}

      this.instantiated_gateway = gateway;

      return Promise.resolve(gateway);

    }

    createProcessingParameters(){

      du.debug('Create Processing Parameters');

      if(!_.has(this, 'customer')){
        eu.throwError('server', 'Process.createProcessingParameters assumes customer property');
      }

      if(!_.has(this, 'selected_credit_card')){
        eu.throwError('server', 'Process.createProcessingParameters assumes selected_credit_card property');
      }

      if(!_.has(this, 'amount')){
        eu.throwError('server', 'Process.createProcessingParameters assumes amount property');
      }

      let parameters = {customer: this.customer, creditcard: this.selected_credit_card, amount: this.amount};

      //validate here?

      return Promise.resolve(parameters);

    }

}
