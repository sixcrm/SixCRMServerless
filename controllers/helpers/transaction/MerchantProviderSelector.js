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
        }
      };

      this.parameter_validation = {
        'rebill': global.SixCRM.routes.path('model','entities/rebill.json'),
        'session': global.SixCRM.routes.path('model','entities/session.json')
      };

      this.instantiateParameters();

      this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
      this.loadBalancerAssociationController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancerAssociation.js');

    }

    buildMerchantProviderGroups(){

      du.debug('Build Merchant Provider Groups');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'buildMerchantProviderGroups'}))
      .then(() => this.acquireRebillProperties())
      .then(() => this.acquireLoadBalancerAssociations())
      .then(() => this.sortRebillProductsByLoadBalancerAssociations())
      .then(() => this.transformLoadBalancersToMerchantProviders())
      .then(() => {

        process.exit();

      })

    }

    transformLoadBalancersToMerchantProviders(){

      du.debug('Transform Load Balancers To Merchant Providers');

      let creditcard = this.parameters.get('creditcard');

      let sorted_married_product_groups = this.parameters.get('soretedmarriedproductgroups');

      return objectutilities.map(sorted_married_product_groups, loadbalancer => {

        let amount = this.calculateAmount(sorted_married_product_groups[loadbalancer]);

        return this.selectMerchantProvider({loadbalancer: loadbalancer, amount: amount, creditcard: creditcard});

      });

    }

    selectMerchantProvider({loadbalancer, amount, creditcard}){

      du.debug('Select Merchant Provider');

      //get creditcardproperties
      //select
      //return

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

      this.parameters.set('soretedmarriedproductgroups', sorted_product_groups);

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
