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
        
}

module.exports = new productScheduleController();