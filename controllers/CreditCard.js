'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

class CreditCardController {

	constructor(){
	
	}
	
	getAddress(creditcard){
		return new Promise((resolve, reject) => {
			resolve(creditcard.address);
		});	
	}
	
	getCreditCard(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.credit_cards_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							
							reject(new Error('More than one record returned for credit card ID.'));
							
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
	storeCreditCard(creditcard){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {

			dynamoutilities.queryRecords(process.env.credit_cards_table, 'ccnumber = :ccnumberv', {':ccnumberv': creditcard.ccnumber}, 'ccnumber-index', (error, creditcards) => {
				
				if(_.isError(error)){ reject(error);}
				
				var card_identified = false;

				creditcards.forEach(function(item){
						
					if(controller_instance.isSameCreditCard(creditcard, item)){
						
						resolve(item);
						
						card_identified = true;
						
						return;
						
					}
					
				});
				
				if(card_identified == false){
				
					controller_instance.saveCreditCard(creditcard).then((data) => {
					
						resolve(data);
		
					}).catch((error) => {
					
						reject(error);
						
					});
			
				}
		
			});
			
		});
	
	}
	
	saveCreditCard(creditcard, callback){
		
		return new Promise((resolve, reject) => {
		
			if(!_.has(creditcard, 'id')){
				creditcard.id = uuidV4();
			}
	
			dynamoutilities.saveRecord(process.env.credit_cards_table, creditcard, (error, data) => {
		
				if(_.isError(error)){ return reject(error); }
		
				return resolve(creditcard);
		
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
	
		return creditcard;
	
	}

}

module.exports = new CreditCardController();
