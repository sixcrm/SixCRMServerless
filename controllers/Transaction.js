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
	
	getTransactionProducts(transaction){
		
		return transaction.products.map((transactionproduct) => {
			
			var base_product = {
				"amount": transactionproduct.amount,
				"product": transactionproduct.product
			};
			
			if(_.has(transactionproduct, "shippingreceipt")){
				base_product['shippingreceipt'] = transactionproduct.shippingreceipt;
			}
			
			return base_product;
			
		});	
		
	}
	
	getTransactionProduct(transaction_product){
	
		if(!_.has(transaction_product, "product")){ return null; }
		
		return new Promise((resolve, reject) => {
		
			productController.get(transaction_product.product).then((product) => {
		
				transaction_product['product'] = product;
		
				resolve(transaction_product);
				
			});
			
		});
		
	}
	
	getProducts(transaction){
		
		if(!_.has(transaction, "products")){ return null; }
		
		return Promise.all(transaction.products.map(transaction_product => this.getTransactionProduct(transaction_product)));
		
	}
        
	getTransactionsByRebillID(id){

		return this.listBySecondaryIndex('rebill_id', id, 'rebill-index');
		
	}
	
	putTransaction(params, processor_response, callback){
		
		var transaction = this.createTransactionObject(params, processor_response);
		
		return this.create(transaction);
	
	}
	
	createTransactionObject(params, processor_response){
		
		var return_object = {
			rebill_id: params.rebill.id,
			processor_response: JSON.stringify(processor_response),
			amount: params.amount,
			date: timestamp.createDate(),
			products: params.products
		}
		
		return return_object;
		
	}

}

module.exports = new transactionController();
