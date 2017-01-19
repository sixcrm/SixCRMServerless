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

if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

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
	
	getRecord(process.env.customers_table, 'email = :emailv',{':emailv': duplicate_body['email']}, 'email-index', (error, data) => {
		
		if(_.isError(error)){
			return lr.issueError('Error reading from customers table.', 500, event, error, callback);
		}
		
		var customer_id = null;
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items) && data.Items.length > 0){
		
			var customer = data.Items[0];
			customer_id = customer.id;
			
			putSession(customer_id, (error, data) => {
				
				if(_.isError(error)){
					return lr.issueError('Error writing to sessions table.', 500, event, error, callback);	
				}	
				
				var result_message = {
					session: data,
					customer: customer
				}
				
				return lr.issueResponse(200, {
					message: 'Success',
					results: result_message
				}, callback);
				
			});
			
		}else{
		
			customer_id = duplicate_body['id'] = uuidV4();
				
			saveRecord(process.env.customers_table, duplicate_body, (error, data) => {
				
				if(_.isError(error)){
					lr.issueError('Error writing to customers table.', 500, event, error, callback);
				}
				
				putSession(customer_id, (error, data) => {

					if(_.isError(error)){
						lr.issueError('Error writing to sessions table.', 500, event, error, callback);
					}
					
					var result_message = {
						session: data,
						customer: duplicate_body
					}
					
					return lr.issueResponse(200, {
						message: 'Success',
						results: result_message
					}, callback);
					
				});
	
			});
		}
		
	});
			
};

var putSession = function(customer_id, callback){
	
	getRecord(process.env.sessions_table, 'customer = :customerv', {':customerv': customer_id}, 'customer-index', (error, data) => {
		
		if(_.isError(error)){ callback(error, null);}
		
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
		
		saveSession(customer_id, (error, data) => {
			
			if(_.isError(error)){ callback(error, null);}
		
			callback(null, data);
		
		});
		
	});
	
};	

var getTimeDifference = function(created){
	var now = timestamp.createTimestampSeconds();
	return now - created;
};

var saveSession = function(customer_id, callback){
	
	var session = {
		id: uuidV4(),
		customer: customer_id,
		completed: 'false',
		created: timestamp.createTimestampSeconds(),
		modified: 'false'
	};
		
	saveRecord(process.env.sessions_table, session, (error, data) => {
			
		if(_.isError(error)){
	
			callback(error, null);

		}
		
		callback(null, session);

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