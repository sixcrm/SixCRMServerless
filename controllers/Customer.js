'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');

class CustomerController {

	constructor(){
	
	}
		
	getAddress(customer){
		return new Promise((resolve, reject) => {
			resolve(customer.address);
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
				
			dynamoutilities.queryRecords(process.env.customers_table, 'email = :emailv',{':emailv': duplicate_body['email']}, 'email-index', (error, data) => {
				
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
	
}

module.exports = new CustomerController();
