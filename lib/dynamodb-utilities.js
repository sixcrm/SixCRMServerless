'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');

class DynamoDBUtilities {

	constructor(stage){

		if (stage === 'local' || process.env.IS_OFFLINE) {
			
			this.dynamodb = new AWS.DynamoDB.DocumentClient({
				region: 'localhost',
				endpoint:process.env.dynamo_endpoint
			});
			
			this.dynamoraw = new AWS.DynamoDB({
				region: 'localhost',
				endpoint:process.env.dynamo_endpoint
			});
			
		} else {
		
			this.dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
			
			this.dynamoraw = new AWS.DynamoDB({region: 'us-east-1'});
			
		}

	}
	
	//ACL enabled
	scanRecords(table, parameters, callback){

		var params = {
			TableName: table,
			FilterExpression: parameters.filter_expression,
			ExpressionAttributeValues: parameters.expression_attribute_values
		};
		
		if(_.has(parameters, 'expression_attribute_names')){
			params.ExpressionAttributeNames = parameters.expression_attribute_names;
		}
		
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

	//ACL enabled
	scanRecordsFull(table, parameters, callback){

		var params = {
			TableName: table,
		};
		
		if(parameters.filter_expression !== null){
			params.FilterExpression = parameters.filter_expression;
		}
		
		if(parameters.expression_attribute_values !== null){
			params.ExpressionAttributeValues = parameters.expression_attribute_values;
		}
		
		if(_.has(parameters, 'expression_attribute_names')){
			params.ExpressionAttributeNames = parameters.expression_attribute_names;
		}
		
		if(_.has(parameters, "limit")){
			params.Limit = parameters.limit;
		};
		
		if(_.has(parameters, "ExclusiveStartKey")){
			params.ExclusiveStartKey = parameters.ExclusiveStartKey;
		}
			
		this.dynamodb.scan(params, function(err, data) {
			
			if(_.isError(err)){
				return callback(err, err.stack);
			}

			callback(null, data);

		});

	}
	
	//ACL enabled
	queryRecords(table, parameters, index, callback){
		
		var params = {
			TableName: table,
			IndexName: index
		};
		
		if(parameters.key_condition_expression !== null){
			params.KeyConditionExpression = parameters.condition_expression;
		}
		
		if(parameters.expression_attribute_values !== null){
			params.ExpressionAttributeValues = parameters.expression_attribute_values;
		}
		
		if(_.has(parameters, 'expression_attribute_names')){
			params.ExpressionAttributeNames = parameters.expression_attribute_names;
		}
		
		if(_.has(parameters, 'filter_expression') && !_.isNull(parameters.filter_expression)){
			params.FilterExpression = parameters.filter_expression;
		}
		
		du.debug('Query Parameters (last hop)', params);
		
		this.dynamodb.query(params, function(err, data) {

			if(_.isError(err)){
				
				du.warning(params);
				//callback is not a function?
				return callback(err, err.stack);
				
			}

			if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
				return callback(null, data.Items);
			}

		});

	}
	
	//ACL enabled
	saveRecord(table, item, callback){

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
	
	//ACL enabled
	//Technical Debt:  might need to update this for reserved keywords
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

	//ACL enabled
	//Technical Debt:  might need to update this for reserved keywords
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
	 
	deleteTable(table, callback){
		
		var params = {
			TableName:table
		};
		
		this.dynamoraw.deleteTable(params, function(err, data) {
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
