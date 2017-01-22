'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var merchantProviderController = require('./MerchantProvider.js');

class loadBalancerController {

	constructor(){
	
	}
	
	getMerchantProviders(loadbalancer){
		
		return Promise.all(loadbalancer.merchantproviders.map(merchantprovider => merchantProviderController.getMerchantProvider(merchantprovider.id)));
        
	}
	
	getLoadBalancerHydrated(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			controller_instance.getLoadBalancer(id).then((loadbalancer) => {
				
				controller_instance.getMerchantProviders(loadbalancer).then((merchant_providers) =>{
					
					for(var i = 0; i < loadbalancer.merchantproviders.length; i++){
						
						for(var j = 0; j < merchant_providers.length; j++){
							
							if(loadbalancer.merchantproviders[i].id == merchant_providers[j].id){
								
								var distribution = loadbalancer.merchantproviders[i].distribution;
								
								loadbalancer.merchantproviders[i] = {merchantprovider: merchant_providers[j], distribution: distribution};
								
							}
							
						}
					
					}
					
					resolve(loadbalancer);
					
				}).catch((error) => {
					
					reject(error);
					
				});
				
			}).catch((error) => {
				
				reject(error);
				
			});
			
		});
		
	}
	
	getLoadBalancer(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.loadbalancers_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						resolve(data[0]);
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple loadbalancers returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
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
    	
    	var controller_instance = this;
    	
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
				
    			break;
    		default:
    			throw new Error('Unrecognized merchant provider: '+merchantprovider.processor);
    			break;
    			
    	}
    }
    
    process(loadbalancer, params){
    	
    	var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			controller_instance.selectMerchantProvider(loadbalancer).then((merchantprovider) => {
				
				var processor = this.createProcessorClass(merchantprovider);
				
				processor.process(params).then((processor_response) => {
					
					resolve(processor_response);
						
				}).catch((error) => {
				
					reject(error);
					
				});
			
			}).catch((error) => {
				
				reject(error);
				
			});
			
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