'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

class TransactionController {

	constructor(){
	
	}
	
	getParentRebill(transaction){
		
		var rebillController = require('./Rebill.js');
		
		var id = transaction.rebill_id;
		
		return sessionController.getSession(id);
		
	}
	
	listTransactions(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.transactions_table, query_parameters, (error, data) => {
				
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
							transactions: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
	}
	
	getTransaction(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.transactions_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
						resolve(data[0]);
					}else{
						if(data.length > 1){
							reject(new Error('multiple transactions returned where one should be returned.'));
						}else{
							resolve([]);
						}
						
					}
					
				}
				
			});
			
        });
        
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
			
			this.saveTransaction(transaction).then((data) => {
			
				resolve(transaction);
				
			}).catch((error) => {
			
				reject(error);
				
			});
		
		});
	
	}
	
	saveTransaction(transaction){
	
		return new Promise((resolve, reject) => {
		
			dynamoutilities.saveRecord(process.env.transactions_table, transaction, (error, data) => {
				if(_.isError(error)){
					reject(error);
				}
				resolve(data);
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

module.exports = new TransactionController();
