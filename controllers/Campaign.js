'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

var productController = require('./Product.js');
var loadBalancerController = require('./LoadBalancer.js');
var productScheduleController = require('./ProductSchedule.js');
var affiliateController = require('./Affiliate.js');

class CampaignController {

	constructor(){
	
	}
	
	getProducts(campaign){
		
		return campaign.products.map(id => productController.getProduct(id));
        
	}
	
	getLoadBalancerHydrated(campaign){
		
		return loadBalancerController.getLoadBalancerHydrated(campaign.loadbalancer);
		
	}
	
	getLoadBalancer(campaign){
		
		return loadBalancerController.getLoadBalancer(campaign.loadbalancer);
		
	}
	
	getProductSchedules(campaign){
		
		return campaign.productschedules.map(id => productScheduleController.getProductSchedule(id));
		
	}
	
	getProductSchedulesHydrated(campaign){
		
		return Promise.all(campaign.productschedules.map(id => productScheduleController.getProductScheduleHydrated(id)));
		
	}
	
	getAffiliate(campaign){
		
		return affiliateController.getAffiliate(campaign.affiliate);
		
	}
	
	hydrate(campaign){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			controller_instance.getLoadBalancerHydrated(campaign).then((loadbalancer) => {
				
				campaign.loadbalancer = loadbalancer;
				
				return campaign;
				
			}).then((campaign) =>{
				
				controller_instance.getProductSchedulesHydrated(campaign).then((product_schedules) => {
					
					campaign.productschedules = product_schedules;
					
					return campaign;
					
				}).then((campaign) => {
					
					controller_instance.getAffiliate(campaign).then((affiliate) => {
						
						campaign.affiliate = affiliate;
						
						resolve(campaign);
						
					}).catch((error) => {
						throw error;
					});
					
				}).catch((error) => {
					throw error;
				});
				
			}).then((campaign) => {
				return campaign;
			}).catch((error) => {
				throw error;
			});
			
		});
		
	}	
	
	getHydratedCampaign(id){
		
		return new Promise((resolve, reject) => {
			
			this.getCampaign(id).then((campaign) => {
				
				this.hydrate(campaign).then((campaign) => {

					resolve(campaign);
					
				}).catch((error) => {
					reject(error);
				});
			
			}).catch((error) => {
				reject(error);
			});
			
		});
		
	}
	
	getCampaign(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.campaigns_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						resolve(data[0]);
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple campaigns returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
			});
			
        });
        
    }
    
    validateProducts(products, campaign){
	
		if(!_.has(campaign, 'productschedules') || !_.isArray(campaign.productschedules) || campaign.productschedules.length < 1){
		
			throw new Error('Invalid product schedule.');
		
		}
		
		var product_schedules = campaign.productschedules;
	
			
		for(var i = 0; i < products.length; i++){
			var product_id = products[i].id;
			var product_identified = false;
			
			for(var j = 0; j < product_schedules.length; j++){
				var product_schedule = product_schedules[j].schedule;
				for(var k = 0; k <product_schedule.length; k++){
					if(_.isEqual(product_id, product_schedule[k].product.id)){
						product_identified = true;
					}
				}
			}
			if(product_identified == false){
				throw new Error('Product does not agree with campaign product schedule: '+product_id);
			}
		}
		
		return true;

	}
    
    productSum(products, campaign){
		
		var return_amount = 0.0;
		
		products.forEach(product => {
			
			var product_found = false;
		
			campaign.productschedules.forEach(productschedule => {
				
				productschedule.schedule.forEach(schedule_product => {
			
					if(schedule_product.product.id == product.id){
					
						product_found = true;
					
						return_amount += parseFloat(schedule_product.price);
					
					}
				
				});
			
				if(!product_found){
					throw new Error('Product not found in campaign.');
				}
			
			});
			
		});
		
		return parseFloat(return_amount);
	
	}	
        
}

module.exports = new CampaignController();