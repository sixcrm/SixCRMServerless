'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');
var entityController = require('./Entity.js');

class transactionController extends entityController {

	constructor(){
		super(process.env.transactions_table, 'transaction');
		this.table_name = process.env.transactions_table;
		this.descriptive_name = 'transaction';
	}
	
	//this was screwy....
	getParentRebill(transaction){
		
		var rebillController = require('./Rebill.js');
		
		return rebillController.get(transaction.rebill_id);

		
	}
        
	getTransactionsByRebillID(id){
		
		return new Promise((resolve, reject) => {
		
			dynamoutilities.queryRecords(process.env.transactions_table, 'rebill_id = :rebill_idv', {':rebill_idv': id}, 'rebill-index', (error, data) => {
				
				if(_.isError(error)){ reject(error);}

				if(_.isArray(data)){
					
					resolve(data);
					
				}
	
			});
	
		});
		
	}
	
	putTransaction(params, processor_response, callback){
		
		return new Promise((resolve, reject) => {
		
			var transaction = this.createTransactionObject(params, processor_response);
			
			this.save(transaction).then((data) => {
			
				resolve(transaction);
				
			}).catch((error) => {
			
				reject(error);
				
			});
		
		});
	
	}
	
	createTransactionObject(params, processor_response){
		
		var transaction_products = [];
		if(_.has(params, "products") && _.isArray(params.products)){
			params.products.forEach((product) => {
				transaction_products.push(product.id);
			});
		}

		var return_object = {
			id: uuidV4(),
			rebill_id: params.rebill_id,
			processor_response: JSON.stringify(processor_response),
			amount: params.amount,
			date: timestamp.createDate()
		}
		
		return return_object;
		
	}
	
	//??
	updateSession(session, products, callback){
		
		return new Promise((resolve, reject) => {
		
			var products = getProductIds(products);
	
			var session_products = session.products;
	
			if(_.isArray(session.products) && session.products.length > 0){
	
				var updated_products = session_products.concat(products);
		
			}else{
		
				var updated_products = products;
		
			}
	
			var modified = timestamp.createTimestampSeconds();
			
			dynamoutilities.updateRecord(process.env.sessions_table, {'id': session.id}, 'set products = :a, modified = :m', {":a": updated_products, ":m": modified.toString()}, (error, data) => {
				
				if(_.isError(error)){
					reject(error);
				}
			
				session.products = updated_products;
	
				resolve(session);
					
			});
			
		});
		
	}
	
	
}

module.exports = new transactionController();
