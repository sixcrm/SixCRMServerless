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
	
	saveSession(customer_id, callback){
	
		var session = {
			id: uuidV4(),
			customer: customer_id,
			completed: 'false',
			created: timestamp.createTimestampSeconds(),
			modified: 'false'
		};
		
		dynamoutilities.saveRecord(process.env.sessions_table, session, (error, data) => {
			
			if(_.isError(error)){
	
				callback(error, null);

			}
		
			callback(null, session);

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
		
		this.getSessionByCustomerID(customer_id)
		.then((data) => {
			
			if(_.isArray(data) && data.length > 0){
				data.forEach(function(item){
					if(_.has(item, 'completed') && item.completed == 'false'){
						if(_.has(item, "created")){
							var time_difference = timestamp.getTimeDifference(item.created);
							if(time_difference < (60*60*24*7)){
								return callback(null, item);
							}	
						}
					}
				});
			}
			
			this.saveSession(customer_id, (error, data) => {
		
				if(_.isError(error)){ callback(error, null);}
	
				callback(null, data);
	
			});
		
		})
		.catch((error) => {
		
			callback(error, null);
			
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
	
}

module.exports = new SessionController();
