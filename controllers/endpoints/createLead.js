'use strict';
const _ = require('underscore');
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();

var timestamp = require('../../lib/timestamp.js');

var customerController = require('../../controllers/Customer.js');
var affiliateController = require('../../controllers/Affiliate.js');
var campaignController = require('../../controllers/Campaign.js');
var sessionController = require('../../controllers/Session.js');

class createLeadController {
	
	constructor(){
	
	}
	
	execute(event){
		
		return this.acquireBody(event).then(this.validateInput).then(this.createLead);
	}	
	
	acquireBody(event){

		return new Promise((resolve, reject) => {
			
			var duplicate_body;
			try {
				duplicate_body = JSON.parse(event['body']);
			} catch (e) {
				duplicate_body = event.body;
			}
			
			resolve(duplicate_body);
			
		});
		
	}
	
	validateInput(event){
		
		return new Promise((resolve, reject) => {
			
			var customer_schema;
			var address_schema;
			var creditcard_schema;

			try{

				customer_schema = require('../../model/customer');
				address_schema = require('../../model/address');
				creditcard_schema = require('../../model/creditcard');

			} catch(e){

				reject(new Error('Unable to load validation schemas.'));

			}

			var validation;

			var params = JSON.parse(JSON.stringify(event));
			
			try{
				var v = new Validator();
				v.addSchema(address_schema, '/Address');
				v.addSchema(creditcard_schema, '/CreditCard');
				validation = v.validate(params, customer_schema);
			}catch(e){

				reject(new Error('Unable to instantiate validator.'));

			}

			if(validation['errors'].length > 0){

				reject(new Error('One or more validation errors occurred.'));

			}

			if(params.email && !validator.isEmail(params.email)){
				validation.errors.push('"email" field must be a email address.');
			}

			if(validation['errors'].length > 0){

				reject(new Error('One or more validation errors occurred.'));

			}
	
			resolve(params)

		});
		
	}
	
	createLead (event) {
		
		console.log('here');
		var params = event;
		var promises = [];
		
		if(!params.campaign_id || !_.isString(params.campaign_id)){
			throw new Error('A lead must be associated with a campaign');
		}

		var getCampaign = campaignController.get(params.campaign_id);
		var getCustomer = customerController.getCustomerByEmail(params.email);

		promises.push(getCampaign);
		promises.push(getCustomer);

		// NOTE is this really what we wanted here what happenes when there isn't an affiliate?
		if(params.affiliate_id){
			var getAffiliate = affiliateController.get(params.affiliate_id);
			promises.push(getAffiliate);
		}


		return Promise.all(promises).then((promises) => {
			var campaign = promises[0];
			var customer = promises[1];
			var affiliate = promises[2];

			if(!_.has(affiliate, 'id')){
				throw new Error('A invalid affiliate id is specified.');
			}
			if(!_.has(campaign, 'id')){
				throw new Error('A invalid campaign id is specified.');
			}

			//If a customer exists, return the payload
			if(_.has(customer, "id")){

						return sessionController.putSession({
							customer_id: customer.id,
							campaign_id: campaign.id,
							affiliate_id: params.affiliate_id
						}).then((session) => {
							return {
								session: session,
								customer: customer,
								campaign: campaign,
								affiliate: affiliate
							};

						});

			} else {
			// Customer does not exist, lets create the customer and return the session payload

				return customerController.create(params).then((customer) => {

					return sessionController.putSession({customer_id: customer.id, campaign_id: campaign.id, affiliate_id: params.affiliate_id}).then((session) => {

						//note that the customer here appears to be a id value.  We want a complete customer object...
						return {
							session: session,
							customer: customer
						};

					});

				});

			}
			
		});
		
	}
	
}

module.exports = new createLeadController();