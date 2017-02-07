'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');
const uuidV4 = require('uuid/v4');

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

var customerController = require('../../controllers/Customer.js');
var affiliateController = require('../../controllers/Affiliate.js');
var campaignController = require('../../controllers/Campaign.js');
var sessionController = require('../../controllers/Session.js');

module.exports.createlead = (event, context, callback) => {
	
	var duplicate_body;
	try {
    	duplicate_body = JSON.parse(event['body']);
	} catch (e) {
		duplicate_body = event.body;
	}
	
	var customer_schema;
	var address_schema;
	var creditcard_schema;
	
	try{
	
		customer_schema = JSON.parse(fs.readFileSync('./model/customer.json','utf8'));
		address_schema = JSON.parse(fs.readFileSync('./model/address.json','utf8'));
		creditcard_schema = JSON.parse(fs.readFileSync('./model/creditcard.json','utf8'));
		
	} catch(e){
		
		return lr.issueError('Unable to load validation schemas.', 500, event, e, callback);		
	
	}
			
	var validation;
	
	try{
		var v = new Validator();
		v.addSchema(address_schema, '/Address');
		v.addSchema(creditcard_schema, '/CreditCard');
		validation = v.validate(duplicate_body, customer_schema);
	}catch(e){
		
		return lr.issueError('Unable to instantiate validator.', 500, event, e, callback);
	
	}
	
	if(validation['errors'].length > 0){
		
		return lr.issueError('One or more validation errors occurred.', 500, event, new Error(validation.errors), callback);
				
	}
	
	if(_.has(duplicate_body, 'email') && !validator.isEmail(duplicate_body['email'])){
		validation.errors.push('"email" field must be a email address.');	
	}
	
	if(validation['errors'].length > 0){		
		
		return lr.issueError('One or more validation errors occurred.', 500, event, new Error(validation.errors), callback);
		
	}
	
	var campaign_id;
	if(_.has(duplicate_body, "campaign_id") && _.isString(duplicate_body.campaign_id)){
		campaign_id = duplicate_body.campaign_id;
	}else{
		return lr.issueError('A lead must be associated with a campaign', 500, event, new Error('A lead must be associated with a campaign'), callback);
	}
	
	var affiliate_id;
	if(_.has(duplicate_body, "affiliate_id")){
		affiliate_id = duplicate_body['affiliate_id'];
	}
	
	campaignController.get(campaign_id).then((campaign) => {
			
		if(!_.has(campaign, 'id')){
			return lr.issueError('A invalid campaign id is specified.', 500, event, new Error('A invalid campaign id is specified.'), callback);
		}
		
		affiliateController.get(affiliate_id).then((affiliate) => {
			
			if(_.isString(affiliate_id) && !_.has(affiliate, 'id')){
				return lr.issueError('A invalid affiliate id is specified.', 500, event, new Error('A invalid affiliate id is specified.'), callback);
			}
			
			customerController.getCustomerByEmail(duplicate_body['email']).then((customer) => {

				if(_.has(customer, "id")){

					sessionController.putSession({customer_id: customer.id, campaign_id: campaign.id, affiliate_id: affiliate_id}).then((session) => {
				
						var result_message = {
							session: session,
							customer: customer,
							campaign: campaign,
							affiliate: affiliate
						}
				
						return lr.issueResponse(200, {
							message: 'Success',
							results: result_message
						}, callback);
	
					});
		
				}else{
			

					var customer_id = duplicate_body['id'] = uuidV4();
			

					customerController.save(duplicate_body).then((customer) => {
				

						sessionController.putSession({customer_id: customer.id, campaign_id: campaign.id, affiliate_id: affiliate_id}).then((session) => {
					

							//note that the customer here appears to be a id value.  We want a complete customer object...
							var result_message = {
								session: session,
								customer: customer
							}
	
							return lr.issueResponse(200, {
								message: 'Success',
								results: result_message
							}, callback);
	
						}).catch((error) => {
							lr.issueError(error, 500, event, error, callback);
						});
			
					}).catch((error) => {
						lr.issueError(error, 500, event, error, callback);
					});
			
				}
		
			}).catch((error) => {
				return lr.issueError(error, 500, event, error, callback);
			});
		
		}).catch((error) => {
			return lr.issueError(error, 500, event, error, callback);
		});
		
	}).catch((error) => {
		return lr.issueError(error, 500, event, error, callback);
	});
		
};