'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

var productScheduleController = require('./ProductSchedule.js');
var rebillController = require('./Rebill.js');
var customerController = require('./Customer.js');
var transactionController = require('./Transaction.js');
var campaignController = require('./Campaign.js');

class SessionController {

	constructor(){
		this.session_length = 3600;
	}
	
	getCustomer(session){
		
		return customerController.get(session.customer);
        
	}
	
	getCampaign(session){
		
		var id = session;
		if(_.has(session, "id")){
			id = session.id;
		}
		return campaignController.getCampaign(id);
        
	}
	
	getCampaignHydrated(session){
		
		var id = session;
		if(_.has(session, "id")){
			id = session.id;
		}
		return campaignController.getHydratedCampaign(id);
        
	}
	
	//uh, WTF
	getTransactions(session){
		
		return new Promise((resolve, reject) => {
			
			var session_transactions = [];
			
			rebillController.getRebillsBySessionID(session.id).then((rebills) => {
				
				Promise.all(rebills.map((rebill) => {
					
					return new Promise((resolve, reject) => {
							
						transactionController.getTransactionsByRebillID(rebill.id).then((transactions) => {
							
							transactions.map((transaction) => {
							
								session_transactions.push(transaction)
								
							});
							
							resolve(transactions);
							
						}).catch((error) => {
					
							reject(error)
						
						});
						
					});
					
				})).then((transactions) => {
				
					resolve(session_transactions);
					
				}).catch((error) => {
					
					reject(error);
					
				});
		
			}).catch((error) => {
				
				reject(error);
			
			});
					
		});
		
	}
	
	getRebills(session){
		
		return rebillController.getRebillsBySessionID(session);
        
	}
	
	getProductSchedules(session){
		
		return session.product_schedules.map(schedule => productScheduleController.get(schedule));
        
	}
	
	getProducts(session){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			var session_products = [];
			
			rebillController.getRebillsBySessionID(session.id).then((rebills) => {
				
				Promise.all(rebills.map((rebill) => {
					
					return new Promise((resolve, reject) => {
						
						var productsController = require('./Product.js');

						productsController.getProducts(rebill.products).then((products) => {
							
							resolve(products);
							
						});
						
					});
					
				})).then((products) => {
					
					products.map(product_object => {
						
						product_object.map(embeded_product => {
							
							session_products.push(embeded_product);
							
						});
						
					});
					
					resolve(session_products);
					
				}).catch((error) => {
					
					reject(error);
					
				});

			}).catch((error) => {
				reject(error);
			});
			
		});
		
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
	
	getSessionHydrated(id){
		
		return new Promise((resolve, reject) => {
				
			this.getSession(id).then((session) => {
				
				this.hydrate(session).then((session) => {	
					
					console.log(session);
					process.exit();
					
					resolve(session);
					
				}).catch((error) => {
				
					reject(error);
					
				});
				
			});
			
			
        });
		
	}
	
	hydrate(session){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
		
			controller_instance.getCampaignHydrated(session.campaign).then((campaign) => {
	
				session.campaign = campaign;
				
				return session;
				
			}).then((session) => {
				
				controller_instance.getCustomerHydrated(session.customer).then((customer) => {
					
					session.customer = customer;
					
					return session;
					
				}).then((session) => {
					
					resolve(session);
					
				}).catch((error) => {
			
					throw error;
				
				});
				
			}).catch((error) => {
			
				throw error;
				
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
	
	updateSessionProductSchedules(session, product_schedules){
		
		return new Promise((resolve, reject) => {
		
			var session_product_schedules = session.product_schedules;
			
			var purchased_product_schedules = [];
			product_schedules.forEach((schedule) => {
				purchased_product_schedules.push(schedule.id);
			});
			
			session_product_schedules = _.union(purchased_product_schedules, session_product_schedules);
			
			var modified = timestamp.createTimestampSeconds();
	
			dynamoutilities.updateRecord(process.env.sessions_table, {'id': session.id}, 'set product_schedules = :product_schedulesv, modified = :modifiedv', {":product_schedulesv": session_product_schedules, ":modifiedv": modified.toString()}, (error, data) => {
			
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
	
	validateProductSchedules(product_schedules, session){
	
		if(!_.has(session, 'product_schedules') || !_.isArray(session.product_schedules) || session.product_schedules.length < 1){
		
			return true;
		
		}
	
		for(var i = 0; i < product_schedules.length; i++){
			var product_schedule_id = product_schedules[i].id;
			for(var j = 0; j < session.product_schedules.length; j++){
				if(_.isEqual(product_schedule_id, session.product_schedules[j])){
					throw new Error('Product schedule already belongs to this session');
				}
			}
		}

		return true;

	}
	
}

module.exports = new SessionController();
