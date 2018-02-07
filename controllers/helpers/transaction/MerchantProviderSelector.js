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

module.exports = class MerchantProviderSelector extends TransactionUtilities {

    constructor(){

      super();

      this.parameter_definition = {
        buildMerchantProviderGroups:{
          required:{
            rebill:'rebill',
            creditcard: 'creditcard'
          },
          optional:{}
        },
        selectMerchantProviderFromLoadBalancer:{
          required:{
            'smp.loadbalancerid':'loadbalancer_id',
            'smp.amount':'amount',
            'smp.creditcard':'creditcard'
          },
          optional:{}
        }
      };

      this.parameter_validation = {
        'rebill': global.SixCRM.routes.path('model','entities/rebill.json'),
        'session': global.SixCRM.routes.path('model','entities/session.json'),
        'creditcard': global.SixCRM.routes.path('model', 'entities/creditcard.json'),
        'sortedmarriedproductgroups': global.SixCRM.routes.path('model','helpers/transaction/merchantproviderselector/sortedmarriedproductgroups.json'),
        'smp.loadbalancerid':global.SixCRM.routes.path('model','definitions/uuidv4.json'),
        'smp.amount':global.SixCRM.routes.path('model','definitions/currency.json'),
        'smp.creditcard':global.SixCRM.routes.path('model','entities/creditcard.json')
      };

      this.instantiateParameters();

      this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
      this.loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');
      this.loadBalancerAssociationController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancerAssociation.js');
      this.creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
      this.analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

    }

    buildMerchantProviderGroups(){

      du.debug('Build Merchant Provider Groups');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'buildMerchantProviderGroups'}))
      .then(() => this.acquireRebillProperties())
      .then(() => this.acquireLoadBalancerAssociations())
      .then(() => this.acquireCreditCardProperties())
      .then(() => this.sortRebillProductsByLoadBalancerAssociations())
      .then(() => this.transformLoadBalancersToMerchantProviders())
      .then(() => {

        process.exit();

      })

    }

    acquireCreditCardProperties(){

      du.debug('Acquire CreditCard Properties');

      return this.acquireCreditCard()
      .then(() => this.setCreditCardBINNumber())
      .then(() => this.getCreditCardProperties());

    }

    transformLoadBalancersToMerchantProviders(){

      du.debug('Transform Load Balancers To Merchant Providers');

      let creditcard = this.parameters.get('creditcard');
      let sorted_married_product_groups = this.parameters.get('sortedmarriedproductgroups');

      let transformed_married_product_groups_promises = objectutilities.map(sorted_married_product_groups, loadbalancer => {

        let amount = this.calculateAmount(sorted_married_product_groups[loadbalancer]);

        return this.selectMerchantProviderFromLoadBalancer({loadbalancer_id: loadbalancer, amount: amount, creditcard: creditcard});

      });

      return Promise.all(transformed_married_product_groups_promises).then(results => {

        du.info(results);  process.exit();

      });


    }

    selectMerchantProviderFromLoadBalancer({loadbalancer_id, amount, creditcard}){

      du.debug('Select Merchant Provider');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'selectMerchantProviderFromLoadBalancer'}))
      .then(() => this.getLoadBalancer())
      .then(() => this.getMerchantProviders())
      .then(() => this.getMerchantProviderSummaries())
      .then(() => this.marryMerchantProviderSummaries())
      .then(() => this.getLoadBalancerSummary())
      .then(() => this.filterMerchantProviders())
      .then(() => this.selectMerchantProviderWithDistributionLeastSumOfSquares())
      .then((merchantprovider) => {

        this.parameters.set('selected_merchantprovider', merchantprovider);

        return merchantprovider;

      });

    }

    getLoadBalancer(){

      du.debug('Get Loadbalancer');

      let loadbalancer_id = this.parameters.get('smp.loadbalancerid');

      return this.loadBalancerController.get({id:loadbalancer_id}).then((loadbalancer) => {

        this.parameters.set('smp.loadbalancer', loadbalancer);

        return true;

      });

    }

    getLoadBalancerSummary(){

      du.debug('Get Loadbalancer Summary');

      let loadbalancer = this.parameters.get('smp.loadbalancer');
      let merchant_providers = this.parameters.get('smp.merchantproviders');

      let monthly_summary = arrayutilities.serial(loadbalancer.merchantproviders, (current, next) => {

          let merchant_provider = arrayutilities.find(merchant_providers, merchant_provider => {
            return (merchant_provider.id == next.id);
          });

          current = current + parseFloat(merchant_provider.summary.summary.thismonth.amount);

          return current;

        },
        0.0
      );

      loadbalancer.summary = {
        month:{
          sum: monthly_summary
        }
      };

      this.parameters.set('loadbalancer', loadbalancer);

    }

    getMerchantProviders(){

      du.debug('Get Merchant Providers');

      let loadbalancer = this.parameters.get('smp.loadbalancer');

      return this.loadBalancerController.getMerchantProviders(loadbalancer).then((merchant_providers) => {

        this.parameters.set('smp.merchantproviders', merchant_providers);

        return true;

      });

    }

    getMerchantProviderSummaries(){

      du.debug('Get Merchant Provider Summaries');

      let merchant_providers = this.parameters.get('smp.merchantproviders');

      let merchant_provider_ids = arrayutilities.map(merchant_providers, merchant_provider => merchant_provider.id);

      let parameters = {
        analyticsfilter:{
          merchantprovider: merchant_provider_ids
        }
      };

      return this.analyticsController.getMerchantProviderSummaries(parameters).then(results => {

        this.parameters.set('smp.merchantprovidersummaries', results.merchantproviders);

        return true;

      });

    }

    marryMerchantProviderSummaries(){

      du.debug('Marry Merchant Provider Summaries');

      let merchant_provider_summaries = this.parameters.get('smp.merchantprovidersummaries');
      let merchant_providers = this.parameters.get('smp.merchantproviders');

      arrayutilities.map(merchant_provider_summaries, (summary) => {

        arrayutilities.filter(merchant_providers, (merchant_provider, index) => {

          if(merchant_provider.id == summary.merchantprovider.id){
            merchant_providers[index].summary = summary;
          }

        });

      });

      this.parameters.set('smp.merchantproviders', merchant_providers);

      return Promise.resolve(true);

    }

    filterMerchantProviders(){

      du.debug('Filter Merchant Providers');

      let merchant_providers = this.parameters.get('smp.merchantproviders');
      let creditcard = this.parameters.get('smp.creditcard');
      let amount = this.parameters.get('smp.amount');
      let loadbalancer = this.parameters.get('smp.loadbalancer');

      const MerchantProviderGeneralFilter = global.SixCRM.routes.include('helpers','transaction/filters/MerchantProviderGeneralFilter.js');
      const MerchantProviderLSSFilter = global.SixCRM.routes.include('helpers','transaction/filters/MerchantProviderLSSFilter.js');

      return MerchantProviderGeneralFilter.filter({merchant_providers:merchant_providers, creditcard:creditcard, amount:amount})
      .then((merchant_providers) => MerchantProviderLSSFilter.filter({merchant_providers: merchant_providers, creditcard: creditcard, amount: amount}))
      .then(merchant_providers => {
        this.parameters.set('smp.merchantproviders', merchant_providers);
      });

    }

    pickMerchantProvider(){

      du.debug('Pick Merchant Provider');

    }

    acquireCreditCard(){

      du.debug('Acquire Credit Card');

      let creditcard = this.parameters.get('creditcard');

      return this.creditCardController.get({id:creditcard}).then(result => {

        this.parameters.set('creditcard', result);

        return true;

      });

    }

    setCreditCardBINNumber(){

      du.debug('Set CreditCard BIN Number');

      let creditcard = this.parameters.get('creditcard');

      let binnumber = this.creditCardController.getBINNumber(creditcard.number);

      if(_.isNull(binnumber)){

        eu.throwError('server', 'Unable to determine BIN Number.');

      }

      creditcard.bin = binnumber;

      this.parameters.set('creditcard', creditcard);

      return true;

    }

    getCreditCardProperties(){

      du.debug('Get Credit Card Properties');

      let creditcard = this.parameters.get('creditcard');

      let analytics_parameters = {
        binfilter: {
          binnumber:[parseInt(creditcard.bin)]
        }
      };

      return this.analyticsController.getBINList(analytics_parameters).then((properties) => {

        if(_.isNull(properties)){
          eu.throwError('not_found', 'Unable to identify credit card properties.');
        }

        if(_.has(properties, 'bins') && arrayutilities.nonEmpty(properties.bins)){

          creditcard.properties = properties.bins[0];

          this.parameters.set('creditcard', creditcard);

          return true;

        }

        return false;

      });


    }

    calculateAmount(product_group_group){

      du.debug('Calculate Amount');

      return arrayutilities.serial(
        product_group_group,
        (current, next) => {
          return (current + (next.amount * next.quantity));
        },
        0.0
      );

    }

    sortRebillProductsByLoadBalancerAssociations(){

      du.debug('sortRebillProductsByLoadBalancerAssociations');

      let rebill = this.parameters.get('rebill');
      let associated_load_balancers = this.parameters.get('loadbalancerassociations');

      let married_product_groups = arrayutilities.map(rebill.products, product_group => {

        let associated_load_balancer = arrayutilities.find(associated_load_balancers, associated_load_balancer => {
          return (associated_load_balancer.entity == product_group.product.id);
        });

        product_group.loadbalancerassociation = associated_load_balancer;

        return product_group;

      });

      let sorted_product_groups = arrayutilities.group(married_product_groups, married_product_group => {
        return married_product_group.loadbalancerassociation.loadbalancer;
      });

      this.parameters.set('sortedmarriedproductgroups', sorted_product_groups);

      return true;

    }

    acquireRebillProperties(){

      du.debug('Acquire Rebill Properties');

      let rebill = this.parameters.get('rebill');

      var promises = [
        this.rebillController.getParentSession(rebill)
      ];

      return Promise.all(promises).then((promises) => {

        this.parameters.set('session', promises[0]);

        return true;

      });

    }

    acquireLoadBalancerAssociations(){

      du.debug('Acquire Load Balancer Associations');

      let rebill = this.parameters.get('rebill');

      let product_ids = arrayutilities.map(rebill.products, product_group => {
        return product_group.product.id;
      });

      let campaign_id = this.parameters.get('session').campaign;

      return this.loadBalancerAssociationController.listByEntitiesAndCampaign({entities: product_ids, campaign: campaign_id})
      .then(result => this.loadBalancerAssociationController.getResult(result, 'loadbalancerassociations'))
      .then(result => {

        this.parameters.set('loadbalancerassociations', result);
        return true;

      });

    }

}
