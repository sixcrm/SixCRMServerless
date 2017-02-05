'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

var productController = require('./Product.js');
var loadBalancerController = require('./LoadBalancer.js');
var productScheduleController = require('./ProductSchedule.js');
var affiliateController = require('./Affiliate.js');
var emailController = require('./Email.js');

class CampaignController {

	constructor(){
	
	}
	
	getEmails(campaign){
		
		return campaign.emails.map(id => emailController.get(id));
        
	}
	
	getProducts(campaign){
		
		return campaign.products.map(id => productController.get(id));
        
	}
	
	getLoadBalancerHydrated(campaign){
		
		return loadBalancerController.getLoadBalancerHydrated(campaign.loadbalancer);
		
	}
	
	getLoadBalancer(campaign){
		
		return loadBalancerController.get(campaign.loadbalancer);
		
	}
	
	getProductSchedules(campaign){
		
		return campaign.productschedules.map(id => productScheduleController.getProductSchedule(id));
		
	}
	
	getProductSchedulesHydrated(campaign){
		
		return Promise.all(campaign.productschedules.map(id => productScheduleController.getProductScheduleHydrated(id)));
		
	}
	
	getAffiliate(campaign){
		
		return affiliateController.get(campaign.affiliate);
		
	}
	
	listCampaigns(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.campaigns_table, query_parameters, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data)){
					
					var pagination_object = {
						count: '',
						end_cursor: '',
						has_next_page: 'false'
					}
					
					if(_.has(data, "Count")){
						pagination_object.count = data.Count;
					}
					
					if(_.has(data, "LastEvaluatedKey")){
						if(_.has(data.LastEvaluatedKey, "id")){
							pagination_object.end_cursor = data.LastEvaluatedKey.id;
						}
					}
					
					var has_next_page = 'false';
					if(_.has(data, "LastEvaluatedKey")){
						pagination_object.has_next_page = 'true';
					}
					
					resolve(
						{
							campaigns: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
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
					
					resolve(campaign);
					
					/*
					controller_instance.getAffiliate(campaign).then((affiliate) => {
						
						campaign.affiliate = affiliate;
					
						resolve(campaign);
						
					}).catch((error) => {
						throw error;
					});
					*/
					
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
    
    validateProductSchedules(product_schedules, campaign){
	
		if(!_.has(campaign, 'productschedules') || !_.isArray(campaign.productschedules) || campaign.productschedules.length < 1){
		
			throw new Error('Invalid product schedule.');
		
		}
		
		var campaign_product_schedules = campaign.productschedules;
		
		
		for(var i = 0; i < product_schedules.length; i++){
			
			var schedule_found = false;
				
			for(var j = 0; j < campaign_product_schedules.length; j++){
				
				if(product_schedules[i].id == campaign_product_schedules[j].id){
					
					schedule_found = true;
					
				}
				
			}
			
			if(schedule_found == false){
			
				throw new Error('Product schedule does not agree with campaign product schedule: '+product_schedules[i].id);
				
			}
			
		}
	
		return true;

	}
        
}

module.exports = new CampaignController();