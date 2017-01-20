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
	
	getProducts(products_array){
		
		return new Promise((resolve, reject) => {
			
			if(_.isArray(products_array)){
				var products_object = {};
				var index = 0;
				products_array.forEach(function(value) {
					index++;
					var product_key = ":productvalue"+index;
					products_object[product_key.toString()] = value;
				});
	
				dynamoutilities.scanRecords(process.env.products_table, "id IN ("+Object.keys(products_object).toString()+ ")", products_object, (error, products) => {
		
					if(_.isError(error)){ reject(error);}
		
					if(!_.isEqual(products_array.length, products.length)){
		
						reject(new Error('Unrecognized products in products list.'));
					}
		
					resolve(products);
		
				});
				
			}else{
				
				reject(new Error('products_array must be a array of product id\'s.'));
				
			}
			
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
