'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');

class ProductController {

	constructor(){
	
	}
	
	getPrices(product){
		return new Promise((resolve, reject) => {
			resolve(product.prices);
		});	
	}
	
	getRecurring(product){
		return new Promise((resolve, reject) => {
			resolve(product.recurring);
		});	
	}
	
	getProduct(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.products_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							reject(new Error('More than one record returned for product ID.'));
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
}

module.exports = new ProductController();
