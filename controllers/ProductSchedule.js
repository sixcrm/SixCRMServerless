'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var productController = require('./Product.js');
var entityController = require('./Entity.js');

class productScheduleController extends entityController {

	constructor(){
		super(process.env.product_schedules_table, 'productschedule');
		this.table_name = process.env.product_schedules_table;
		this.descriptive_name = 'productschedule';
	}
	
	getProduct(scheduled_product){
		
		return productController.get(scheduled_product.product);
		
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
		
		return Promise.all(product_schedule.schedule.map(ps => productController.get(ps.product_id)));
		
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
    	
    	return Promise.all(product_schedules.map(product_schedule => this.get(product_schedule)));
    	
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