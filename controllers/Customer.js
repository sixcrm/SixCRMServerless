'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var entityController = require('./Entity.js');
var creditCardController = require('./CreditCard.js');

class customerController extends entityController {

	constructor(){
		super(process.env.customers_table, 'customer');
		this.table_name = process.env.customers_table;
		this.descriptive_name = 'customer';
	}
		
	getAddress(customer){
		return new Promise((resolve, reject) => {
			resolve(customer.address);
		});	
	}
	
	getCreditCards(customer){
		
		if(_.has(customer, "creditcards")){
			
			return customer.creditcards.map(id => creditCardController.get(id));
			
		}else{
			
			return null;
			
		}
		
	}
	
	getCustomerByEmail(email){
		
		return this.getBySecondaryIndex('email', email, 'email-index');
		
	}
	
}

module.exports = new customerController();
