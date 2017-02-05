'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');

class DynamoDBUtilities {
	
	constructor(stage){
		
		switch(stage){
			case 'local':
				this.dynamodb = new AWS.DynamoDB.DocumentClient({
					region: 'localhost', 
					endpoint:process.env.dynamo_endpoint
				});
				break;
			default:
				this.dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
				break;
		}

	}
	
	scanRecords(table, parameters, callback){
	
		var params = {
			TableName: table,
			FilterExpression: parameters.filter_expression,
			ExpressionAttributeValues: parameters.expression_attribute_values
		};
		
		if(_.has(parameters, "limit")){
			params.Limit = parameters.limit;
		};
	
		this.dynamodb.scan(params, function(err, data) {
			if(_.isError(err)){
				return callback(err, err.stack);
			}
			
			if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
				return callback(null, data.Items);
			}
		
		});
	
	}
	
	scanRecordsFull(table, parameters, callback){
	
		var params = {
			TableName: table,
			FilterExpression: parameters.filter_expression,
			ExpressionAttributeValues: parameters.expression_attribute_values
		};
		
		if(_.has(parameters, "limit")){
			params.Limit = parameters.limit;
		};
	
		this.dynamodb.scan(params, function(err, data) {
			if(_.isError(err)){
				return callback(err, err.stack);
			}
			
			callback(null, data);
		
		});
	
	}
	
	queryRecords(table, condition_expression, parameters, index, callback){
	
		var params = {
			TableName: table,
			IndexName: index,
			KeyConditionExpression: condition_expression,
			ExpressionAttributeValues: parameters
		};
		
		this.dynamodb.query(params, function(err, data) {
		
			if(_.isError(err)){
				return callback(err, err.stack);
			}
		
			if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
				return callback(null, data.Items);
			}
		
		});
	
	}
	
	saveRecord(table, item, callback){
		
		//somehow this fixes things...
		item = JSON.parse(JSON.stringify(item));
		
		var params = {
			TableName:table,
			Item:item
		};
		
		this.dynamodb.put(params, function(err, data) {
		  if(_.isError(err)){
			callback(err, err.stack);
		  }
		  callback(null, data);
		});
	
	}
	
	updateRecord(table, key, expression, expression_params, callback){
		
		var params = {
			TableName:table,
			Key: key,
			UpdateExpression: expression,
			ExpressionAttributeValues:expression_params,
			ReturnValues:"UPDATED_NEW"
		};
	
		this.dynamodb.update(params, function(err, data) {
		  if (err){
			 callback(err, err.stack); 
		  }else{     
			callback(null, data);           
		  }
		});

	}
	
	deleteRecord(table, key, expression, expression_params, callback){
		
		var params = {
			TableName:table,
			Key: key,
			ConditionExpression: expression,
			ExpressionAttributeValues:expression_params
		};
		
		this.dynamodb.delete(params, function(err, data) {
		  if (err){
			 callback(err, err.stack); 
		  }else{     
			callback(null, data);           
		  }
		});
		
	}
	
}

var ddb = new DynamoDBUtilities(process.env.stage);
module.exports = ddb;