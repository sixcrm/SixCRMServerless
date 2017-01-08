'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');

module.exports.confirmorder = (event, context, callback) => {
	
	var lambda_response = {};		
	lambda_response.statusCode = 500;
	lambda_response['body'] = JSON.stringify({
		message: 'An unexpected error occured.'
	});

	var duplicate_querystring = event.queryStringParameters;
	
	if(_.isString(duplicate_querystring)){
	
		try{
			duplicate_querystring = querystring.parse(duplicate_querystring);	
		}catch(e){
			var lambda_response = {};		
			lambda_response.statusCode = 500;
			lambda_response['body'] = JSON.stringify({
				message: 'An unexpected error occured.',
				error: e
			});		
			callback(null, lambda_response)		
		}
		
	}
	
	var schema;
	
	try{
		schema = JSON.parse(fs.readFileSync('./endpoints/confirmorder/schema/confirmorder.json','utf8'));
	} catch(e){
		console.log(e);
		lambda_response.body = JSON.stringify(
			{message: 'Unable to load schema'}
		);
		callback(null, lambda_response)
	}
			
	var validation;
	
	try{
		var v = new Validator();
		validation = v.validate(duplicate_querystring, schema);
	}catch(e){
		lambda_response.body = JSON.stringify(
			{message: e.message}
		);
		callback(null, lambda_response);
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
		
	validation.errors = [];
	
	if(validation['errors'].length > 0){		
		var error_response = {'validation_errors':JSON.stringify(validation['errors'])};		
		lambda_response['body'] = JSON.stringify({
			message: 'One or more validation errors occurred.',
			input: event,
			errors: error_response
		});
		callback(null, lambda_response);
	}
	
	var confirm_order_response = {
		message:'Order Confirmed', 
		transaction_id:duplicate_querystring.transaction_id,
		transaction_type:"Recurring",
		customer_id:"123456",
		order_contents:{
			products:[
				{
					id: "123456",
					description:"Product 1",
					amount:"34.99",
					currency: "USD"
				},
				{
					id: "123457",
					description:"Shipping Protection",
					amount:"2.99",
					currency:"USD"
				},
				{
					id: "123458",
					description:"Upsell 1",
					amount:"18.99",
					currency:"USD"
				},
				{
					id: "123459",
					description:"Upsell 2",
					amount:"18.99",
					currency:"USD"
				}
			]
		}
	};
	
	lambda_response.statusCode = 200;
	lambda_response['body'] = JSON.stringify({
		message: 'Success',
		results: confirm_order_response
	});
	callback(null, lambda_response);
			
};
