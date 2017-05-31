'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

var merchantProviderController = global.routes.include('controllers', 'entities/MerchantProvider.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class loadBalancerController extends entityController {

    constructor(){
        super('loadbalancer');
    }

    getMerchantProviderConfigurations(loadbalancer){

        du.debug('Get Merchant Provider Configurations');

        return loadbalancer.merchantproviders.map((merchantproviderconfiguration) => {

            return {
                "distribution": merchantproviderconfiguration.distribution,
                "merchantprovider": merchantproviderconfiguration.id
            };

        });

    }

    getMerchantProviderConfiguration(merchantproviderconfiguration){

        du.debug('Get Merchant Provider Configuration');

        return merchantProviderController.get(merchantproviderconfiguration.merchantprovider);

    }

    getMerchantProviders(loadbalancer){

        du.debug('Get Merchant Providers');

        return Promise.all(loadbalancer.merchantproviders.map(merchantprovider => merchantProviderController.get(merchantprovider.id)));

    }

	//Isn't there a better way?
    getLoadBalancerHydrated(id){

        du.debug('Get Loadbalancer Hydrated');

        var controller_instance = this;

        return controller_instance.get(id).then((loadbalancer) => {

            return controller_instance.getMerchantProviders(loadbalancer).then((merchant_providers) =>{

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

    selectMerchantProvider(loadbalancer){

    	du.debug('Select Merchant Provider');

    	return new Promise((resolve, reject) => {

        var distribution_sum = this.sumLoadBalancerDistributions(loadbalancer.merchantproviders);

        if(distribution_sum > 0){

            var roll = this.randomRoll(distribution_sum);

            var mp = this.pickMerchantProvider(roll, loadbalancer);

            return resolve(mp);

        }else{

            return reject(new Error('Distribution sum must be greater than 0.'));

        }

    	});

    }

    sortMerchantProviders(merchantproviders){

        du.debug('Sort Merchant Providers');

    	merchantproviders.sort(function(a, b) {

    		if(a.distribution != b.distribution){

        return parseFloat(a.distribution) - parseFloat(b.distribution);

    }

        if(a.merchantprovider.id != b.merchantprovider.id){

            var aid = a.merchantprovider.id.toUpperCase();
            var bid = b.merchantprovider.id.toUpperCase();

            if (aid < bid) {
                return -1;
            }

            if (aid > bid) {
                return 1;
            }

        }

        return -1

    });

        return merchantproviders;

    }

    pickMerchantProvider(roll, loadbalancer){

        du.debug('Pick Merchant Provider');

    	return new Promise((resolve, reject) => {

        var merchantproviders = this.sortMerchantProviders(loadbalancer.merchantproviders);

        var progressive_sum = 0.0;

        for(var i = 0; i < merchantproviders.length; i++){

            var merchantprovider = merchantproviders[i];

            if(parseFloat(roll) <= parseFloat((parseFloat(merchantprovider.distribution) + progressive_sum))){

                resolve(merchantprovider);

                return;

            }else{

                progressive_sum += parseFloat(merchantprovider.distribution);

            }

        };

        reject(new Error('Something strange happened picking a merchant provider.'));

    });

    }

    randomRoll(max){

    	return Math.random() * parseFloat(max);

    }

    createProcessorClass(merchantprovider){

        du.debug('Create Processor Class');

    	switch(merchantprovider.merchantprovider.processor){
    		case 'NMI':

    			var NMIController = global.routes.include('controllers', 'vendors/merchantproviders/NMI.js');

        var _nmi = new NMIController({
            username: merchantprovider.merchantprovider.username,
            password: merchantprovider.merchantprovider.password,
            endpoint: merchantprovider.merchantprovider.endpoint
        });

        return _nmi;

    		default:
    			throw new Error('Unrecognized merchant provider: '+merchantprovider.processor);

    	}
    }

    process(loadbalancer, params){

        du.debug('Process');

        return this.selectMerchantProvider(loadbalancer).then((merchantprovider) => {

            var processor = this.createProcessorClass(merchantprovider);

            return processor.process(params).then((response) => {

                //Technical Debt:  This is very clumsy.
                response.merchant_provider = merchantprovider.merchantprovider.id;

                return response;

            });

        });

    }

    sumLoadBalancerDistributions(merchantproviders){

        du.debug('Sum Load Balancer Distributions');

    	var distributionSum = 0.0;

    	merchantproviders.forEach((merchantprovider) => {
        distributionSum += parseFloat(merchantprovider.distribution);
    	});

        return distributionSum;

    }

}

module.exports = new loadBalancerController();
