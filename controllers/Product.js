'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');
var fulfillmentProviderController = require('./FulfillmentProvider.js');

var entityController = require('./Entity.js');

class ProductController extends entityController {

	constructor(){
		super(process.env.products_table, 'product');
		this.table_name = process.env.products_table;
		this.descriptive_name = 'product';
	}
	
	getFulfillmentProvider(product){
		
		return fulfillmentProviderController.get(product.fulfillment_provider);
		
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
	
}

module.exports = new ProductController();
