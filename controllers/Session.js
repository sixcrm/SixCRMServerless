'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

var productController = require('./Product.js');
var customerController = require('./Customer.js');
var transactionController = require('./Transaction.js');

class SessionController {

	constructor(){
	
	}
	
	getCustomer(session){
		
		return customerController.getCustomer(session.customer);
        
	}
	
	getProducts(session){
		
		return session.products.map(id => productController.getProduct(id));
        
	}
	
	getTransactions(id){
		
		return transactionController.getTransactionsBySessionID(id);
        
	}
	
	getSession(id){
	
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.sessions_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							reject(new Error('More than one record returned for session ID.'));
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
	saveSession(customer_id){
		
		return new Promise((resolve, reject) => {
		
			var session = {
				id: uuidV4(),
				customer: customer_id,
				completed: 'false',
				created: timestamp.createTimestampSeconds(),
				modified: 'false'
			};
		
			dynamoutilities.saveRecord(process.env.sessions_table, session, (error, data) => {
			
				if(_.isError(error)){
	
					reject(error);

				}
		
				resolve(session);

			});	
			
		});

	}
	
	getSessionByCustomerID(customer_id){
		
		return new Promise((resolve, reject) => {
			dynamoutilities.queryRecords(process.env.sessions_table, 'customer = :customerv', {':customerv': customer_id}, 'customer-index', (error, data) => {
				if(_.isError(error)){
					reject(error);
				}
				resolve(data);
			});
		});
		
	}
	
	putSession(customer_id, callback){
		
		return new Promise((resolve, reject) => {
		
			this.getSessionByCustomerID(customer_id).then((data) => {
			
				if(_.isArray(data) && data.length > 0){
					data.forEach(function(item){
						if(_.has(item, 'completed') && item.completed == 'false'){
							if(_.has(item, "created")){
								var time_difference = timestamp.getTimeDifference(item.created);
								if(time_difference < (60*60*24*7)){
									resolve(item);
								}	
							}
						}
					});
				}
			
				this.saveSession(customer_id, (error, data) => {
		
					if(_.isError(error)){ reject(error);}
	
					resolve(data);
	
				});
		
			})
			.catch((error) => {
		
				reject(error);
			
			});
			
		});
	
	}
	
	updateSession(session, callback){
		
		return new Promise((resolve, reject) => {
		
			var completed = 'true';
	
			var modified = timestamp.createTimestampSeconds();
	
			dynamoutilities.updateRecord(process.env.sessions_table, {'id': session.id}, 'set completed = :completedv, modified = :modifiedv', {":completedv": completed, ":modifiedv": modified.toString()}, (error, data) => {
			
				if(_.isError(error)){
		
					reject(error);
			
				}else{
		
					resolve(session);
			
				}
		
			});
		
		});
	
	}
	
	validateProducts(products, session){
	
		if(!_.has(session, 'products') || !_.isArray(session.products) || session.products.length < 1){
		
			return true;
		
		}
	
		for(var i = 0; i < products.length; i++){
			var product_id = products[i].id;
			for(var j = 0; j < session.products.length; j++){
				if(_.isEqual(product_id, session.products[j])){
					throw new Error('Product already belongs to this session');
				}
			}
		}

		return true;

	}
	
}

module.exports = new SessionController();
