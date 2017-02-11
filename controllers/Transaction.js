'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

var productController = require('./Product.js');
var entityController = require('./Entity.js');

class transactionController extends entityController {

	constructor(){
		super(process.env.transactions_table, 'transaction');
		this.table_name = process.env.transactions_table;
		this.descriptive_name = 'transaction';
	}
	
	//Technical Debt:  Why is this missing rebill_ids	
	getParentRebill(transaction){
		
		if(_.has(transaction, "rebill_id")){
			var rebillController = require('./Rebill.js');
			return rebillController.get(transaction.rebill_id);
		}else{
			return null;
		}

		
	}
	
	getProduct(id){
		
		return productController.get(id);
		
	}
	
	getProducts(transaction){
		
		if(!_.has(transaction, "products")){ return null; }
		
		return Promise.all(transaction.products.map(transaction_product => this.getTransactionProduct(transaction_product)));
		
	}
	
	getTransactionProducts(transaction){
		
		return transaction.products.map((transactionproduct) => {
			
			return {
				"amount": transactionproduct.amount,
				"product": transactionproduct.product
			};
			
		});	
		
	}
	
	getTransactionProduct(transaction_product){
	
		if(!_.has(transaction_product, "product")){ return null; }
		
		return new Promise((resolve, reject) => {
			
			productController.get(transaction_product.product).then((product) => {
				
				if(_.isError(error)){ reject(error); }
				
				transaction_product['product'] = product;
				
				resolve(transaction_product);
				
			});
			
		});
		
	}
        
	getTransactionsByRebillID(id){
		
		return this.listBySecondaryIndex('rebill_id', id, 'rebill-index');
		
	}
	
	putTransaction(params, processor_response, callback){
		
		var transaction = this.createTransactionObject(params, processor_response);
			
		return this.create(transaction);
	
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

}

module.exports = new transactionController();
