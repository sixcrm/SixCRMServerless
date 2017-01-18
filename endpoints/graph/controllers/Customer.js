'use strict';
const AWS = require("aws-sdk");
const _ = require('underscore');
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

class CustomerController {

	constructor(){
	
	}
		
	getAddress(customer){
		return new Promise((resolve, reject) => {
			resolve(customer.address);
		});	
	}
	
	getCustomer(id){
		
		return new Promise((resolve, reject) => {
				
			var params = {
				TableName: process.env.customers_table,
				KeyConditionExpression: 'id = :idv',
				ExpressionAttributeValues: {':idv': id}
			};
	
			dynamodb.query(params, function(err, data) {
		
				if(_.isError(err)){
					return reject(err);
				}

				if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
					if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items) && data.Items.length > 0){
						return resolve(data.Items[0]);
					}
				}
				
				return resolve(null);
		
			});
			
        });
		
	}
	
}

module.exports = new CustomerController();
