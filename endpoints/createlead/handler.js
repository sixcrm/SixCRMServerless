'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const uuidV4 = require('uuid/v4');

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

var customerController = require('../../controllers/Customer.js');
var affiliateController = require('../../controllers/Affiliate.js');
var campaignController = require('../../controllers/Campaign.js');
var sessionController = require('../../controllers/Session.js');

module.exports.createlead = (event, context, callback) => {

	validateInput(event, callback)
	.then((event) => { return createLead(event, callback); })  //for now pass in callback until we can fix the shitty error handling
	//.then(createLead)  <-- work towards this
	.then((resp) => {
		return lr.issueResponse(200, {
			message: 'Success',
			results: resp
		}, callback);
	})
	.catch((err) => {
		return lr.issueError(err.message, 500, event, err, callback);
	});
};

function validateInput (event, callback) {

	var customer_schema;
	var address_schema;
	var creditcard_schema;

	try{

		customer_schema = require('../../model/customer');
		address_schema = require('../../model/address');
		creditcard_schema = require('../../model/creditcard');

	} catch(e){

		return lr.issueError('Unable to load validation schemas.', 500, event, e, callback);

	}

	var validation;

	var params = JSON.parse(JSON.stringify(event.body));
	try{
		var v = new Validator();
		v.addSchema(address_schema, '/Address');
		v.addSchema(creditcard_schema, '/CreditCard');
		validation = v.validate(params, customer_schema);
	}catch(e){

		return lr.issueError('Unable to instantiate validator.', 500, event, e, callback);

	}

	if(validation['errors'].length > 0){

		return lr.issueError('One or more validation errors occurred.', 500, event, new Error(validation.errors), callback);

	}

	if(params.email && !validator.isEmail(params.email)){
		validation.errors.push('"email" field must be a email address.');
	}

	if(validation['errors'].length > 0){

		return lr.issueError('One or more validation errors occurred.', 500, event, new Error(validation.errors), callback);

	}

	return Promise.resolve(params);
}

function createLead (event, callback) {
	var params = event;
  var promises = [];
	if(!params.campaign_id || !_.isString(params.campaign_id)){
		return lr.issueError('A lead must be associated with a campaign', 500, event, new Error('A lead must be associated with a campaign'), callback);
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
			return lr.issueError('A invalid affiliate id is specified.', 500, event, new Error('A invalid affiliate id is specified.'), callback);
		}
		if(!_.has(campaign, 'id')){
			return lr.issueError('A invalid campaign id is specified.', 500, event, new Error('A invalid campaign id is specified.'), callback);
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
