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
        
}

module.exports = new loadBalancerController();