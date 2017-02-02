'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var productController = require('./Product.js');

class productScheduleController {

	constructor(){
	
	}
	
	getProduct(scheduled_product){
		
		return productController.getProduct(scheduled_product.product);
		
	}
	
	getSchedule(product_schedule){
		
		return product_schedule.schedule.map(scheduled_product => this.getScheduledProduct(scheduled_product));
		
	}
	
	getScheduledProduct(scheduled_product){
		
		return {
			price: scheduled_product.price,
			start: scheduled_product.start,
			end: scheduled_product.end,
			period: scheduled_product.period,
			product: scheduled_product.product_id
		};
		
	}
	
	getProducts(product_schedule){
		
		return Promise.all(product_schedule.schedule.map(ps => productController.getProduct(ps.product_id)));
		
	}
	
	listProductSchedules(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.product_schedules_table, query_parameters, (error, data) => {
				
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
							productschedules: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
	}
	
	getProductScheduleHydrated(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.product_schedules_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						var product_schedule = data[0];
						
						controller_instance.getProducts(product_schedule).then((products) => {
							
							for(var i = 0; i < product_schedule.schedule.length; i++){
								
								for(var j = 0; j < products.length; j++){
									
									if(product_schedule.schedule[i].product_id == products[j].id){
										
										product_schedule.schedule[i].product = products[j];
										
										delete product_schedule.schedule[i].product_id;
										
									}
									
								}
								
							}
							
							resolve(product_schedule);
							
						}).catch((error) => {
							reject(error);
						});
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple product schedules returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
			});
			
        });
        
    }
    
    getProductSchedules(product_schedules){
    	
    	return Promise.all(product_schedules.map(product_schedule => this.getProductSchedule(product_schedule)));
    	
    }
    
	getProductSchedule(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.product_schedules_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						resolve(data[0]);
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple product schedules returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
			});
			
        });
        
    }
    
    getProductForPurchase(day, schedule){
		
		var return_product;
		
    	schedule.forEach((scheduled_product) => {

    		if(parseInt(day) >= parseInt(scheduled_product.start)){

    			if(!_.has(scheduled_product, "end")){
    			
    				return scheduled_product;
    				
    			}
    			
    			if(parseInt(day) < parseInt(scheduled_product.end)){
					
    				return_product = scheduled_product;
    				
    				return true;
    				
    			}
    			
    		}
    		
    	});
    	
    	return return_product;
    	
    }
    
    productSum(day_in_schedule, schedules_for_purchase){
		
		var return_amount = 0.0;
		
		schedules_for_purchase.forEach((schedule) => {
			
			var product_for_purchase = this.getProductForPurchase(day_in_schedule, schedule.schedule);
			
			return_amount += parseFloat(product_for_purchase.price);
				
		});
		
		return parseFloat(return_amount);
	
	}	
        
}

module.exports = new productScheduleController();