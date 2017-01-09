'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');
const uuidV4 = require('uuid/v4');
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

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
	
	var customer_schema;
	var address_schema;
	var creditcard_schema;
	
	try{
		customer_schema = JSON.parse(fs.readFileSync('./model/customer.json','utf8'));
		address_schema = JSON.parse(fs.readFileSync('./model/address.json','utf8'));
		creditcard_schema = JSON.parse(fs.readFileSync('./model/creditcard.json','utf8'));
	} catch(e){
		lambda_response.body = JSON.stringify(
			{message: 'Unable to load validation schemas'}
		);
		callback(null, lambda_response)
	}
			
	var validation;
	
	try{
		var v = new Validator();
		v.addSchema(address_schema, '/Address');
		v.addSchema(creditcard_schema, '/CreditCard');
		validation = v.validate(duplicate_body, customer_schema);
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
	
	if(_.has(duplicate_body, 'email') && !validator.isEmail(duplicate_body['email'])){
		validation.errors.push('"email" field must be a email address.');	
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
	
	duplicate_body['uuid'] = uuidV4();
	
	saveRecord("customers", duplicate_body, (error, data) => {
		
		if(_.isError(error)){
				
			lambda_response['body'] = JSON.stringify({
				message: 'Error writing to customers table.',
				input: event,
				errors: error
			});
			callback(null, lambda_response);
		
		}
		
		var transaction = {
			"uuid": uuidV4(),
			customer: duplicate_body['uuid']
		};
			
		saveRecord(process.env.transactions_table, transaction, (error, data) => {
			
			if(_.isError(error)){
				
				lambda_response['body'] = JSON.stringify({
					message: 'Error writing to transactions table.',
					input: event,
					errors: error
				});
				callback(null, lambda_response);
		
			}
			
			var result_message = {
				transaction_id: transaction['uuid'],
				customer: duplicate_body
			}
	
			lambda_response.statusCode = 200;
			lambda_response['body'] = JSON.stringify({
				message: 'Success',
				results: result_message
			});
	
			callback(null, lambda_response);
			
		});
	
	});
			
};

var saveRecord = function(table, item, callback){
	
	var params = {
		TableName:table,
		Item:item
	};
	
	dynamodb.put(params, function(err, data) {
	  if(_.isError(err)){
	  	callback(err, err.stack);
	  }
	  callback(null, data);
	});
	
}