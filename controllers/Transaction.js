'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

class TransactionController {

	constructor(){
	
	}
	
	getProducts(transaction){
		
		var productController = require('./Product.js');
		
		return transaction.products.map(id => productController.getProduct(id));
        
	}
	
	getTransaction(id){
	
	}
	
	getParentSession(transaction){
		
		var sessionController = require('./Session.js');
		
		var id = transaction.parentsession;
		
		return sessionController.getSession(id);
		
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
        
	getTransactionsBySessionID(id){

		return new Promise((resolve, reject) => {
		
			dynamoutilities.queryRecords(process.env.transactions_table, 'parentsession = :parentsessionv', {':parentsessionv': id}, 'parentsession-index', (error, data) => {
			
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
			parentsession: params.session.id,
			products: transaction_products,
			processor_response: JSON.stringify(processor_response),
			amount: params.amount,
			date: timestamp.createDate()
		}
		
		return return_object;
		
	}
	
	
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
