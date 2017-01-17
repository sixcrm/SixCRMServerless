'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

class DynamoDBUtilities {
	
	static scanRecords(table, scan_expression, parameters, callback){
	
		var params = {
			TableName: table,
			FilterExpression: scan_expression,
			ExpressionAttributeValues: parameters
		};
	
		dynamodb.scan(params, function(err, data) {
			if(_.isError(err)){
				return callback(err, err.stack);
			}
		
			if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
				return callback(null, data.Items);
			}
		
		});
	
	}
	
	static queryRecords(table, condition_expression, parameters, index, callback){
	
		var params = {
			TableName: table,
			IndexName: index,
			KeyConditionExpression: condition_expression,
			ExpressionAttributeValues: parameters
		};
	
		dynamodb.query(params, function(err, data) {
			if(_.isError(err)){
				return callback(err, err.stack);
			}
		
			if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
				return callback(null, data.Items);
			}
		
		});
	
	}
	
}

module.exports = DynamoDBUtilities;