'use strict';
const _ = require('underscore');
const entityController = require('./Entity.js');
const du = require('../lib/debug-utilities');

class creditCardController extends entityController {

	constructor(){
		super(process.env.credit_cards_table, 'creditcard');
		this.table_name = process.env.credit_cards_table;
		this.descriptive_name = 'creditcard';
	}
	
	getAddress(creditcard){
		return Promise.resolve(creditcard.address);
	}
	
	storeCreditCard(creditcard) {

		du.debug('Storing credit card.');

		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			controller_instance.listBySecondaryIndex('ccnumber', creditcard.ccnumber, 'ccnumber-index').then((creditcards) => {

				var card_identified = false;

				creditcards.forEach(function(item){
						
					if(controller_instance.isSameCreditCard(creditcard, item)){
						
						resolve(item);
						
						card_identified = true;
						
						return;
						
					}
					
				});
				
				if(card_identified == false){
				
					return controller_instance.create(creditcard).then((data) => {

						return resolve(data);

					}).catch((error) => {

						return reject(error);

					});
			
				} else {
					return reject(new Error('Card not identified.'));
				}
				
			}).catch((error) => {
				reject(error);
			});
	
		});
	
	}
	
	isSameCreditCard(creditcard1, creditcard2){
	
		if(!_.isEqual(creditcard1.ccv, creditcard2.ccv)){
			return false;
		}
	
		if(!_.isEqual(creditcard1.ccnumber, creditcard2.ccnumber)){
			return false;
		}
	
		if(!_.isEqual(creditcard1.expiration, creditcard2.expiration)){
			return false;
		}
	
		if(!_.isEqual(creditcard1.address, creditcard2.address)){

			return false;
		}
	
		return true;
	}
	
	createCreditCardObject(input_object){
		
		var creditcard = {
			ccnumber: input_object.ccnumber,
			expiration: input_object.ccexpiration,
			ccv: input_object.ccccv,
			name: input_object.name,
			address: input_object.address
		};

		return Promise.resolve(creditcard);
	
	}

}

module.exports = new creditCardController();
