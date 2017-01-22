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
		
		return transaction.products.map(id => productController.getProduct(id));
        
	}
	
	getLoadBalancer(campaign){

		return loadBalancerController.getLoadBalancerHydrated(campaign.loadbalancer);
		
	}
	
	getProductSchedule(campaign){
		
		return productScheduleController.getProductScheduleHydrated(campaign.productschedule);
	}
	
	getAffiliate(campaign){
		
		return affiliateController.getAffiliate(campaign.affiliate);
		
	}
	
	hydrate(campaign){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			controller_instance.getLoadBalancer(campaign).then((loadbalancer) => {
				
				campaign.loadbalancer = loadbalancer;
				
				return campaign;
				
			}).then((campaign) =>{
				
				controller_instance.getProductSchedule(campaign).then((product_schedule) => {
					
					campaign.product_schedule = product_schedule;
					
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
	
		if(!_.has(campaign, 'productschedule') || !_.has(campaign.productschedule, "schedule") || !_.isArray(campaign.productschedule.schedule) || campaign.productschedule.schedule.length < 1){
		
			return true;
		
		}
		
		var campaign_products = campaign.productschedule.schedule;
		
		for(var i = 0; i < products.length; i++){
			var product_id = products[i].id;
			for(var j = 0; j < campaign_products.length; j++){
				if(_.isEqual(product_id, campaign_products[j])){
					return 2;
				}
			}
			throw new Error('Product does not agree with campaign product schedule: '+product_id);
		}

		return true;

	}
    
    productSum(products, campaign){
		
		var return_amount = 0.0;
		
		products.forEach(product => {
			
			var product_found = false;
			
			campaign.product_schedule.schedule.forEach(schedule_product => {
			
				if(schedule_product.product.id == product.id){
					
					product_found = true;
					
					return_amount += parseFloat(schedule_product.price);
					
				}
				
			});
			
			if(!product_found){
				throw new Error('Product not found in campaign.');
			}
			
		});
		
		return parseFloat(return_amount);
	
	}	
        
}

module.exports = new CampaignController();