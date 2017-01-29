'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');
var fulfillmentProviderController = require('./FulfillmentProvider.js');

class ProductController {

	constructor(){
	
	}
	
	getFulfillmentProvider(product){
		
		return fulfillmentProviderController.getFulfillmentProvider(product.fulfillment_provider);
		
	}
	
	createProduct(product){
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.saveRecord(process.env.products_table, product, (error, data) => {
			
				if(_.isError(error)){ reject(error);}
				
				resolve(product);
				
			});
			
		});
		
	}
	
	updateProduct(product){
		
		return new Promise((resolve, reject) => {
		
			dynamoutilities.saveRecord(process.env.products_table, product, (error, data) => {
			
				if(_.isError(error)){ reject(error);}
				
				resolve(product);
				
			});
			
		});
		
	}
	
	deleteProduct(id){
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.deleteRecord(process.env.products_table, { id:id }, null, null, (error, data) => {
			
				if(_.isError(error)){ reject(error);}
				
				resolve({ id });
				
			});
			
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
	
				dynamoutilities.scanRecords(
					process.env.products_table, 
					{
						filter_expression:"id IN ("+Object.keys(products_object).toString()+ ")", 
						expression_attribute_values: products_object
					}, 
					(error, products) => {
		
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
	
	listProducts(cursor, limit){

		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.products_table, query_parameters, (error, data) => {
				
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
							products: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
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
