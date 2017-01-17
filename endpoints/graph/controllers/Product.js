const AWS = require("aws-sdk");
const _ = require('underscore');
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

class ProductController {

	constructor(){
	
	}
	
	getProduct(id){
		
		return new Promise((resolve, reject) => {
				
			var params = {
				TableName: process.env.products_table,
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
				
				return resolve({});
		
			});
			
        });
		
	}
	
}

module.exports = new ProductController();
