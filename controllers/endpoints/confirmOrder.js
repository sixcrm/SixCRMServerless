'use strict';
//note not all of these are required...
const _ = require("underscore");
const querystring = require('querystring');
const du = require('../../lib/debug-utilities.js');

var sessionController = require('../../controllers/Session.js');
var endpointController = require('../../controllers/endpoints/endpoint.js');
var notificationUtils = require('../../lib/notification-utilities');

class confirmOrderController extends endpointController{
	
	constructor(){
		super({
			required_permissions: [
				'user/read',
				'account/read',
				'session/create',
				'session/read',
				'session/update',
				'campaign/read',
				'creditcard/create',
				'creditcard/update',
				'creditcard/read',
				'productschedule/read',
				'loadbalancer/read',
				'product/read',
				'affiliate/read',
				'transaction/read',
				'rebill/read'
			]
		});
	}
	
	execute(event){
		
		return this.preprocessing((event))
			.then(this.acquireQuerystring)
			.then(this.validateInput)
			.then(this.confirmOrder);
		
	}	
	
	acquireQuerystring(event){
		
		du.debug('Acquire Querystring');
		
		return new Promise((resolve, reject) => {
		
			var duplicate_querystring = event.queryStringParameters;
			
			if(!_.isObject(duplicate_querystring)){
	
				if(_.isString(duplicate_querystring)){
	
					try{
						
						duplicate_querystring = querystring.parse(duplicate_querystring);	
						
					}catch(error){
						
						return reject(error);						
						
					}
					
					resolve(duplicate_querystring);
					
				}else{
		
					return reject(new Error('Request querystring is an unexpected format.'));
	
				}
		
			}else{
				
				return resolve(duplicate_querystring);
				
			}
			
		});
		
	}
	
	validateInput(querystring){
		
		du.debug('Validate Input');
		
		return new Promise((resolve, reject) => {
			
			if(!_.isObject(querystring) || !_.has(querystring, 'session_id')){
			
				return reject(new Error('The session_id must be set in the querystring.'));
				
			}
		
			return resolve(querystring);
			
		});
		
	}
	
	confirmOrder (querystring) {
		
		du.debug('Confirm Order');
		
		var promises = [];
		
		return sessionController.get(querystring['session_id']).then((session) => {
			
			if(_.isNull(session)){ throw new Error('The specified session is unavailable.'); }
			if(session.completed == 'true'){ throw new Error('The specified session is already complete.'); }
		
			var getCustomer = sessionController.getCustomer(session);
			var getTransactions = sessionController.getTransactions(session);
			var getTransactionProducts = sessionController.getTransactionProducts(session);

			promises.push(getCustomer);
			promises.push(getTransactions);
			promises.push(getTransactionProducts);
			
			return Promise.all(promises).then((promises) => {
				
				var customer = promises[0];
				var transactions = promises[1];
				var transaction_products = promises[2];
			
				return sessionController.closeSession(session).then(() => {
					
					var results = {session: session, customer: customer, transactions: transactions, transaction_products: transaction_products};

                    notificationUtils.createNotificationObject(
                        global.account,
                        "session",
                        "closed",
                        `Session '${session.id}' has been closed.`
                    ).then((notification_object) => notificationUtils.createNotificationsForAccount(notification_object));

					return results;
					
				});
				
			
			});
		
		});
				
	}
	
}

module.exports = new confirmOrderController();