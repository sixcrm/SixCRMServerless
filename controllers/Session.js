'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');

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
	
}

module.exports = new SessionController();
