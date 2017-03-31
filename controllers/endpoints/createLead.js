'use strict';
const _ = require('underscore');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const du = require('../../lib/debug-utilities.js');

var customerController = require('../../controllers/Customer.js');
var affiliateController = require('../../controllers/Affiliate.js');
var campaignController = require('../../controllers/Campaign.js');
var sessionController = require('../../controllers/Session.js');

//Technical Debt:  We need the account global set.
//Technical Debt:  We may need to make a transaction endpoint parent class.

class createLeadController {

	execute(event){
		
		return this.acquireBody(event)
			.then((event) => this.validateInput(event))
			.then((event) => this.disableACLs(event))
			.then((event) => this.assureCustomer(event))
			.then((event) => this.createSessionObject(event))
			.then((session_object) => this.persistSession(session_object));
			
	}

	acquireBody(event){	
	
		du.debug('Acquire Body');

		var duplicate_body;
		try {
			duplicate_body = JSON.parse(event['body']);
		} catch (e) {
			duplicate_body = event.body;
		}

		return Promise.resolve(duplicate_body);

	}

	validateInput(event){
		
		du.debug('Validate Input');
		
		return new Promise((resolve, reject) => {

			var customer_schema;
			var address_schema;
			var creditcard_schema;

			try{

				customer_schema = require('../../model/customer');
				address_schema = require('../../model/address');
				creditcard_schema = require('../../model/creditcard');

			} catch(e){

				return reject(new Error('Unable to load validation schemas.'));

			}

			var validation;
			var params = JSON.parse(JSON.stringify(event || {}));

			try{
				var v = new Validator();
				v.addSchema(address_schema, '/Address');
				v.addSchema(creditcard_schema, '/CreditCard');
				validation = v.validate(params, customer_schema);
			}catch(e){
				return reject(new Error('Unable to instantiate validator.'));
			}


			if(params.email && !validator.isEmail(params.email)){
				validation.errors.push({message:'"email" field must be an email address.'});
			}
			
			if(!params.campaign_id || !_.isString(params.campaign_id)){
				validation.errors.push({message:'A lead must be associated with a campaign'});
			}

			if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

				var error = {
					message: 'One or more validation errors occurred.',
					issues: validation.errors.map((e)=>{ return e.message; })
				};
				return reject(error);

			}

			return resolve(params)

		});

	}
	
	//Technical Debt:  We still need to be setting the account_id for the objects that we create...
	disableACLs(event){
		
		campaignController.disableACLs();
		
		return Promise.resolve(event);
			
	}
	
	assureCustomer(event){
		
		return new Promise((resolve, reject) => {
			
			customerController.getCustomerByEmail(event.email).then((customer) => {
				
				if(!_.has(customer, 'id')){
					
					return customerController.create(event).then((created_customer) => {
					
						if(_.has(created_customer, 'id')){
						
							return resolve(event);
						
						}
					
						return reject(new Error('Unable to create a new customer.'));
				
					}).catch((error) => {
				
						return reject(error);
				
					});
				
				}else{
				
					return resolve(event);
					
				}
				
			}).catch((error) => {
				
				return reject(error);
				
			});

		});
		
	}
	
	createSessionObject(event){
		
		du.debug('Create Session Object');
		
		return new Promise((resolve, reject) => {
		
			var promises = [];
			
			var getCampaign = campaignController.get(event.campaign_id);
			var getCustomer = customerController.getCustomerByEmail(event.email);
			
			promises.push(getCampaign);
			promises.push(getCustomer);
			
			if(_.has(event, 'affiliate_id')){
				var getAffiliate = affiliateController.get(event.affiliate_id);
				promises.push(getAffiliate);
			}
			
			return Promise.all(promises).then((promises) => {
				
				let campaign = promises[0];
				let customer = promises[1];
				let affiliate = {};
				
				if(promises.length > 2){
					affiliate = promises[2];
					if(!_.has(affiliate, 'id')){ return reject(new Error('A invalid affiliate id is specified.')); }
				}
				
				if(!_.has(campaign, 'id')){ return reject(new Error('A invalid campaign id is specified.')); }
				
				if(!_.has(customer, "id")){ return reject(new Error('A invalid customer id is specified.')); }
					
				let session_object = {
					customer_id: customer.id,
					campaign_id: campaign.id,
				};
					
				if(_.has(affiliate, 'id')){
					session_object['affiliate_id'] = affiliate.id;
				}
					
				return resolve(session_object);
				
			});
			
		});
		
	}
	
	persistSession(session_object){
		
		return new Promise((resolve, reject) => {
		
			sessionController.putSession(session_object).then((session) => {
				
				return resolve(session);

			}).catch((error) => {
			
				return reject(error);
				
			});
			
		});

	}

}

module.exports = new createLeadController();
