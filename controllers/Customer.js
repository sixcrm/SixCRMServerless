'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

class CustomerController {

	constructor(){
	
	}
		
	getAddress(customer){
		return new Promise((resolve, reject) => {
			resolve(customer.address);
		});	
	}
	
	getCreditCards(customer){

		var creditCardController = require('./CreditCard.js');
		
		return customer.creditcards.map(id => creditCardController.getCreditCard(id));
		
	}
	
	listCustomers(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.customers_table, query_parameters, (error, data) => {
				
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
							customers: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
	}
	
	getCustomer(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.customers_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							
							reject(new Error('More than one record returned for customer ID.'));
							
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
	getCustomerByEmail(email){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.customers_table, 'email = :emailv',{':emailv': email}, 'email-index', (error, data) => {
				
				if(_.isError(error)){ reject(error);}
			
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							reject(new Error('More than one record returned for email.'));
						}else{
							resolve([]);							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
	saveCustomer(customer_object){
	
		return new Promise((resolve, reject) => {

			if(!_.has(customer_object, "id")){
				
				customer_object['id'] = uuidV4();
				
			}
			
			dynamoutilities.saveRecord(process.env.customers_table, customer_object, (error, data) => {
				if(_.isError(error)){
					reject(error);
				}
				resolve(data);
			});
			
		});
	}
	
}

module.exports = new CustomerController();
