'use strict';
const AWS = require("aws-sdk");
const _ = require('underscore');
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}
var dynamoutilities = require('../../../lib/dynamodb-utilities.js');
var productController = require('./Product.js');
var customerController = require('./Customer.js');

class TransactionController {

	constructor(){
	
	}
	
	getProducts(transaction){
		
		return transaction.products.map(id => productController.getProduct(id));
        
	}
	
	getTransaction(id){
	
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.transactions_table, 'parentsession = :parentsessionv', {':parentsessionv': id}, 'parentsession-index', (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
					
					if(data.Items.length == 1){
						resolve(data.Items[0]);
					}else{
						
						if(data.Items.length > 1){
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
	
}

module.exports = new TransactionController();
