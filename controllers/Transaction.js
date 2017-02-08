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
	
	getParentRebill(transaction){
		
		//why is this here?
		var rebillController = require('./Rebill.js');
		return rebillController.get(transaction.rebill_id);

		
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
