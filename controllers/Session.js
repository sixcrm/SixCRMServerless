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
		this.session_length = 3600;
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
	
	getSessions(){
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.scanRecords(
				process.env.sessions_table, 
				{
					filter_expression: null, 
					expression_attribute_values: null
				}, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				resolve(data);
				
			});
			
		});
		
	}
	
	listSessions(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.sessions_table, query_parameters, (error, data) => {
				
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
							sessions: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
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
	
	createSessionObject(params){
	
		if(!_.has(params,'customer_id')){
			
			return new Error('A session must be associated with a Customer ID.');
			
		}
		
		if(!_.has(params,'campaign_id')){
		
			return new Error('A session must be associated with a Campaign ID.');
			
		}
		
		var session = {
			id: uuidV4(),
			customer: params.customer_id,
			campaign: params.campaign_id,
			completed: 'false',
			created: timestamp.createTimestampSeconds(),
			modified: 'false'
		};
		
		if(_.has(params, 'affiliate_id') && _.isString(params.affiliate_id)){
			session.affiliate = params.affiliate_id;	
		}
		
		return session;
	
	}
	
	saveSession(session){
		
		return new Promise((resolve, reject) => {
		
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
	
	putSession(parameters, callback){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(parameters, 'customer_id')){
				reject(new Error('Parameters object must have a customer_id'));
			}
			
			if(!_.has(parameters, 'campaign_id')){
				reject(new Error('Parameters object must have a customer_id'));
			}
			
			if(!_.has(parameters, 'affiliate_id')){
				parameters.affiliate_id = null;	
			}
				
			this.getSessionByCustomerID(parameters.customer_id).then((sessions) => {
				
				var session_found = false;

				if(_.isArray(sessions) && sessions.length > 0){
					sessions.forEach((session) => {
						if(_.has(session, 'completed') && session.completed == 'false'){
							if(_.has(session, "created")){
								var time_difference = timestamp.getTimeDifference(session.created);
								if(time_difference < this.session_length){
									resolve(session);
									session_found = true;
									return false;
								}	
							}
						}
					});
				}
			
				if(session_found == false){
					
					var session = controller_instance.createSessionObject({
						customer_id: parameters.customer_id, 
						campaign_id: parameters.campaign_id, 
						affiliate_id: parameters.affiliate_id
					});
					
					this.saveSession(session).then((session) => {
	
						resolve(session);
	
					});
					
				}
		
			}).catch((error) => {
		
				reject(error);
			
			});
			
		});
	
	}
	
	updateSessionProducts(session, products){
		
		return new Promise((resolve, reject) => {
		
			var session_products = session.products;
			
			var purchased_products = [];
			products.forEach((product) => {
				purchased_products.push(product.id);
			});
			
			session_products = _.union(purchased_products, session_products);
			
			var modified = timestamp.createTimestampSeconds();
	
			dynamoutilities.updateRecord(process.env.sessions_table, {'id': session.id}, 'set products = :productsv, modified = :modifiedv', {":productsv": session_products, ":modifiedv": modified.toString()}, (error, data) => {
			
				if(_.isError(error)){
		
					reject(error);
			
				}else{
		
					resolve(session);
			
				}
		
			});
		
		});
		
	}
	
	closeSession(session){
		
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
