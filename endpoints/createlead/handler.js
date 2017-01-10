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
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(_.isString(process.env.dynamo_endpoint) && !_.isEmpty(process.env.dynamo_endpoint)){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:'http://localhost:8001'});
}

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
	
	getRecord(process.env.customers_table, 'email = :emailv',{':emailv': duplicate_body['email']}, 'email-index', (error, data) => {
				
		if(_.isError(error)){
				
			lambda_response['body'] = JSON.stringify({
				message: 'Error reading from customers table.',
				input: event,
				errors: error
			});
			callback(null, lambda_response);
		
		}
		
		var customer_uuid = null;
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items) && data.Items.length > 0){
		
			var customer = data.Items[0];
			customer_uuid = customer.uuid;
			
			putTransaction(customer_uuid, (error, data) => {
				
				if(_.isError(error)){			
					lambda_response['body'] = JSON.stringify({
						message: 'Error writing to transactions table.',
						input: event,
						errors: error
					});
					callback(null, lambda_response);
				}
				
				var result_message = {
					transaction: data,
					customer: customer
				}

				lambda_response.statusCode = 200;
				lambda_response['body'] = JSON.stringify({
					message: 'Success',
					results: result_message
				});

				callback(null, lambda_response);
				
			});
			
		}else{
		
			customer_uuid = duplicate_body['uuid'] = uuidV4();
				
			saveRecord(process.env.customers_table, duplicate_body, (error, data) => {
		
				if(_.isError(error)){
				
					lambda_response['body'] = JSON.stringify({
						message: 'Error writing to customers table.',
						input: event,
						errors: error
					});
					callback(null, lambda_response);
		
				}
				
				putTransaction(customer_uuid, (error, data) => {
					
					if(_.isError(error)){
				
						lambda_response['body'] = JSON.stringify({
							message: 'Error writing to transactions table.',
							input: event,
							errors: error
						});
						callback(null, lambda_response);
		
					}
					
					var result_message = {
						transaction: data,
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
		}
		
	});
			
};

var putTransaction = function(customer_uuid, callback){
	
	getRecord(process.env.transactions_table, 'customer = :customerv', {':customerv': customer_uuid}, 'customer-index', (error, data) => {
		
		if(_.isError(error)){
	
			callback(error, null);

		}
		
		if(_.isObject(data) && _.has(data, "Items")){
			if(_.isArray(data.Items) && data.Items.length > 0){
				data.Items.forEach(function(item){
					if(_.has(item, 'completed') && item.completed == 'false'){
						if(_.has(item, "created")){
							var time_difference = getTimeDifference(item.created);
							if(time_difference < (60*60*24*7)){
								callback(null, item);
							}	
						}
					}
 				});
			}
		}
		
		saveTransaction(customer_uuid, (error, data) => {
			
			if(_.isError(error)){
	
				callback(error, null);

			}
		
			callback(null, data);
		
		});
		
	});
	
};	

var createTimestampInSeconds =  function(){
	return new Date().getTime() / 1000;
}
var getTimeDifference = function(created){
	var now = createTimestampInSeconds();
	return now - created;
};

var saveTransaction = function(customer_uuid, callback){
	
	var transaction = {
		uuid: uuidV4(),
		customer: customer_uuid,
		completed: 'false',
		created: createTimestampInSeconds(),
		modified: 'false'
	};
		
	saveRecord(process.env.transactions_table, transaction, (error, data) => {
			
		if(_.isError(error)){
	
			callback(error, null);

		}
		
		callback(null, transaction);

	});	

};

var getRecord = function(table, condition_expression, parameters, index, callback){
	
	var params = {
		TableName: table,
		IndexName: index,
		KeyConditionExpression: condition_expression,
		ExpressionAttributeValues: parameters
	};
	
	dynamodb.query(params, function(err, data) {
		if(_.isError(err)){
			console.log(err.stack);
			callback(err, err.stack);
		}
		callback(null, data);
	});
	
}

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