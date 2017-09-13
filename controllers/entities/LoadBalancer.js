'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class loadBalancerController extends entityController {

    constructor(){

      super('loadbalancer');

    }

    //Note:  Used in Graph schema
    getMerchantProviderConfigurations(loadbalancer){

        du.debug('Get Merchant Provider Configurations');

        return arrayutilities.map(loadbalancer.merchantproviders, (merchantproviderconfiguration) => {

            return {
                "distribution": merchantproviderconfiguration.distribution,
                "merchantprovider": merchantproviderconfiguration.id
            };

        });

    }

    //Note:  Used in Graph schema
    getMerchantProviderConfiguration(merchantproviderconfiguration){

      du.debug('Get Merchant Provider Configuration');

      return this.executeAssociatedEntityFunction('merchantProviderController', 'get', {id: merchantproviderconfiguration.merchantprovider});

    }

    getMerchantProviders(loadbalancer){

      du.debug('Get Merchant Providers');

      if(arrayutilities.nonEmpty(loadbalancer.merchantproviders)){

        let promises = arrayutilities.map(loadbalancer.merchantproviders, (merchant_provider) => {

          //Technical Debt:  This is likely broken.
          return this.executeAssociatedEntityFunction('merchantProviderController', 'get', {id: merchantproviderconfiguration.merchantprovider});

        });

        return Promise.all(promises);

      }else{

        return null;

      }

    }

    //Note: Necessary because of the meta-object
    getLoadBalancerHydrated(id){

      du.debug('Get Loadbalancer Hydrated');

      return this.get({id: id}).then((loadbalancer) => {

        return this.getMerchantProviders(loadbalancer).then((merchant_providers) =>{

          //Note: This marries the merchant provider to the meta object.
          for(var i = 0; i < loadbalancer.merchantproviders.length; i++){

            for(var j = 0; j < merchant_providers.length; j++){

              if(loadbalancer.merchantproviders[i].id == merchant_providers[j].id){

                var distribution = loadbalancer.merchantproviders[i].distribution;

                loadbalancer.merchantproviders[i] = {merchantprovider: merchant_providers[j], distribution: distribution};

              }

            }

          }

          return loadbalancer;

        });

      });

    }

}

module.exports = new loadBalancerController();
