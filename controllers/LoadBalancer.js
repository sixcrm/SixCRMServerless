'use strict';
var merchantProviderController = require('./MerchantProvider.js');
var entityController = require('./Entity.js');

class loadBalancerController extends entityController {

	constructor(){
		super(process.env.loadbalancers_table, 'loadbalancer');
		this.table_name = process.env.loadbalancers_table;
		this.descriptive_name = 'loadbalancer';
	}
	
	getMerchantProviderConfigurations(loadbalancer){
		
		return loadbalancer.merchantproviders.map((merchantproviderconfiguration) => {
			
			return {
				"distribution": merchantproviderconfiguration.distribution,
				"merchantprovider": merchantproviderconfiguration.id
			};
			
		});
		
	}
	
	getMerchantProviderConfiguration(merchantproviderconfiguration){
		
		return merchantProviderController.get(merchantproviderconfiguration.merchantprovider);
		
	}
	
	getMerchantProviders(loadbalancer){
		
		return Promise.all(loadbalancer.merchantproviders.map(merchantprovider => merchantProviderController.get(merchantprovider.id)));
        
	}
	
	//Isn't there a better way?
	getLoadBalancerHydrated(id){
		
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
    	
    	return new Promise((resolve, reject) => {
    		
			var distribution_sum = this.sumLoadBalancerDistributions(loadbalancer.merchantproviders);
			
			if(distribution_sum > 0){
			
				var roll = this.randomRoll(distribution_sum);
				
				var mp = this.pickMerchantProvider(roll, loadbalancer);
					
				resolve(mp);
			
			}else{
			
				reject(new Error('Distribution sum must be greater than 0.'));
				
			}
    	
    	});
    	
    }
    
    sortMerchantProviders(merchantproviders){
		
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
    	switch(merchantprovider.merchantprovider.processor){
    		case 'NMI':
    			
    			var NMIController = require('./merchantproviders/NMI.js');
    			
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
    	
    	var controller_instance = this;
		
		return controller_instance.selectMerchantProvider(loadbalancer).then((merchantprovider) => {

			var processor = this.createProcessorClass(merchantprovider);

			return processor.process(params);

		});

    }
    
    sumLoadBalancerDistributions(merchantproviders){
    	
    	var distributionSum = 0.0;
    	
    	merchantproviders.forEach((merchantprovider) => {
			distributionSum += parseFloat(merchantprovider.distribution);
    	});
    	
		return distributionSum;
    	
    }
        
}

module.exports = new loadBalancerController();