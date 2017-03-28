'use strict';
const _ = require('underscore');
var entityController = require('./Entity.js');

class creditCardController extends entityController {

	constructor(){
		super(process.env.credit_cards_table, 'creditcard');
		this.table_name = process.env.credit_cards_table;
		this.descriptive_name = 'creditcard';
	}
	
	getAddress(creditcard){
		return new Promise((resolve, reject) => {
			resolve(creditcard.address);
		});	
	}
	
	storeCreditCard(creditcard){
	
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
				
					controller_instance.create(creditcard).then((data) => {
						
						resolve(data);
		
					}).catch((error) => {
					
						reject(error);
						
					});
			
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
		
		return new Promise((resolve, reject) => {
		
			var creditcard = {
				ccnumber: input_object.ccnumber,
				expiration: input_object.ccexpiration,
				ccv: input_object.ccccv,
				name: input_object.name,
				address: input_object.address
			};
			
			resolve(creditcard);
			
		});
		
		//return Promise.resolve(creditcard);
	
	}

}

module.exports = new creditCardController();
