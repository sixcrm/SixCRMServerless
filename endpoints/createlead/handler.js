'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();

module.exports.createlead = (event, context, callback) => {
	
	var lambda_response = {};		
	lambda_response.statusCode = 500;
	lambda_response['body'] = JSON.stringify({
		message: 'An unexpected error occured.'
	});

	var duplicate_body;
	try {
    	duplicate_body = JSON.parse(event['body']);
	} catch (e) {
		duplicate_body = event.body;
	}
	
	var addcustomerjson;
	
	try{
		addcustomerjson = JSON.parse(fs.readFileSync('./endpoints/createlead/schema/addcustomer.json','utf8'));
	} catch(e){
		lambda_response.body = JSON.stringify(
			{message: 'Unable to load schema'}
		);
		callback(null, lambda_response)
	}
			
	var validation;
	
	try{
		var v = new Validator();
		validation = v.validate(duplicate_body, addcustomerjson);
	}catch(e){
		lambda_response.body = JSON.stringify(
			{message: e.message}
		);
		callback(null, lambda_response);
	}
	
	console.log(validation);
	if(validation['errors'].length > 0){		
		var error_response = {'validation_errors':validation['errors']};		
		lambda_response['body'] = JSON.stringify({
			message: 'One or more validation errors occurred.',
			input: event,
			errors: error_response
		});
		callback(null, lambda_response);
	}
		
	validation.errors = [];
	
	if(_.has(duplicate_body, 'email') && !validatator.isEmail(duplicate_body['email'])){
		
		validation.errors.push('"email" field must be a email address.');
		
	}
	
	if(_.has(duplicate_body, 'shipping_email') && !validatator.isEmail(duplicate_body['shipping_email'])){
		
		validation.errors.push('"shipping_email" field must be a email address.');
		
	}
	
	if(_.has(duplicate_body, 'ccnumber') && !validatator.isCreditCard(duplicate_body['ccnumber'])){
		
		validation.errors.push('"ccnumber" must be a credit card number.');
		
	}
	
	if(_.has(duplicate_body, 'shipping') && !validatator.isCurrency(duplicate_body['shipping'])){
		
		validation.errors.push('"shipping" must be a currency amount.');
		
	}
	
	if(_.has(duplicate_body, 'tax') && !validatator.isCurrency(duplicate_body['tax'])){
		
		validation.errors.push('"tax" must be a currency amount.');
		
	}
	
	if(validation['errors'].length > 0){		
		var error_response = {'validation_errors':validation['errors']};		
		lambda_response['body'] = JSON.stringify({
			message: 'One or more validation errors occurred.',
			input: event,
			errors: error_response
		});
		callback(null, lambda_response);
	}
	
	//build request from post variables
	//execute post
	//respond with informations
	
	var lambda_response = {};		
	lambda_response.statusCode = 200;
	lambda_response['body'] = JSON.stringify({
		message: 'Success',
		results:{}
	});
			
};
