'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');
const AWS = require("aws-sdk");

var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

module.exports.confirmorder = (event, context, callback) => {
	
	var duplicate_querystring = event.queryStringParameters;
	
	if(_.isString(duplicate_querystring)){
	
		try{
			duplicate_querystring = querystring.parse(duplicate_querystring);	
		}catch(e){
			
			//toss error
		}
		
	}else{
		//barf
	}
	
	var schema;
	
	try{
		schema = JSON.parse(fs.readFileSync('./endpoints/confirmorder/schema/confirmorder.json','utf8'));
	} catch(e){
		//toss error
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
	
	getSession(duplicate_querystring['session_id'], (error, session) => {
		
		if(_.isError(error)){	
			lr.issueError(error, 500, event, error, callback);
		}
		
		getCustomer(session.customer, (error, customer) => {
		
			if(_.isError(error)){	
				lr.issueError(error, 500, event, error, callback);
			}
		
			getProducts(session.products, (error, products) => {
			
				if(_.isError(error)){	
					lr.issueError(error, 500, event, error, callback);
				}
				
				getTransactions(session.id, (error, transactions) => {
				
					if(_.isError(error)){	
						lr.issueError(error, 500, event, error, callback);
					}
					
					updateSession(session, (error, session) => {
					
						if(_.isError(error)){	
							lr.issueError(error, 500, event, error, callback);
						}
						
						var results = {session: session, customer: customer, products: products, transactions: transactions};
					
						return lr.issueResponse(200, {
							message: 'Success',
							results: results
						}, callback);
					
					});
		
				});
			
			});
		
		});
		
	});
				
};

var updateSession =  function(session, callback){
	
	var completed = 'true';
	
	var modified = timestamp.createTimestampSeconds();
	
	updateRecord(process.env.sessions_table, {'id': session.id}, 'set completed = :completedv, modified = :modifiedv', {":completedv": completed, ":modifiedv": modified.toString()}, (error, data) => {
		
		if(_.isError(error)){
		
			callback(error, error.stack);
			
		}else{
		
			callback(null, session);
			
		}
		
	});
	
}

var getCustomer = function(id, callback){
	
	getRecord(process.env.customers_table, 'id = :idv', {':idv': id}, null, (error, customer) => {
						
		if(_.isError(error)){ return callback(error, null); }
		
		return callback(null, customer);
		
	});	
	
}

var getSession = function(id, callback){
	
	getRecord(process.env.sessions_table, 'id = :idv', {':idv': id}, null, (error, session) => {
						
		if(_.isError(error)){ callback(error, null); }
		
		if(_.has(session, "customer") && _.has(session, 'completed')){
		
			if(_.isEqual(session.completed, 'false')){
				
				callback(null, session);
				
			}else{
			
				callback(new Error('The session has already been completed.'), null);
				
			}
			
		}else{
		
			callback(new Error('An unexpected error occured', null));
			
		}	
		
	});	
	
}

var getRecords = function(table, condition_expression, parameters, index, callback){
	
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
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			callback(null, data.Items);
		}
		
	});
	
}

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
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			
			if(data.Items.length == 1){
				
				callback(null, data.Items[0]);
				
			}else{
				
				callback(null, data.Items);
				
			}
			
		}
		
	});
	
}

var getProducts = function(products_array, callback){
	
	var products_object = {};
	var index = 0;
	products_array.forEach(function(value) {
		index++;
		var product_key = ":productvalue"+index;
		products_object[product_key.toString()] = value;
	});
	
	scanRecords(process.env.products_table, "id IN ("+Object.keys(products_object).toString()+ ")", products_object, (error, products) => {
		
		if(_.isError(error)){ callback(error, null);}
		
		if(!_.isEqual(products_array.length, products.length)){
		
			callback(new Error('Unrecognized products in products list.'), null);
		}
		
		callback(null, products);
		
	});
	
}

var getTransactions = function(session_id, callback){
	
	getRecords(process.env.transactions_table, 'parentsession = :parentsessionv', {':parentsessionv': session_id}, 'parentsession-index', (error, transactions) => {
		
		if(_.isError(error)){ callback(error, null);}
		
		callback(null, transactions);
		
	});
	
}

var scanRecords = function(table, scan_expression, parameters, callback){
	
	var params = {
		TableName: table,
		FilterExpression: scan_expression,
		ExpressionAttributeValues: parameters
	};
	
	dynamodb.scan(params, function(err, data) {
		if(_.isError(err)){
			console.log(err.stack);
			callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			callback(null, data.Items);
		}
		
	});
	
}

var updateRecord = function(table, key, expression, expression_params, callback){
	
	var params = {
		TableName:table,
		Key: key,
		UpdateExpression: expression,
		ExpressionAttributeValues:expression_params,
		ReturnValues:"UPDATED_NEW"
	};
	
	dynamodb.update(params, function(err, data) {
	  if (err){
	  	 callback(err, err.stack); 
	  }else{     
	  	callback(null, data);           
	  }
	});

}
