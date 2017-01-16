const AWS = require("aws-sdk");
const _ = require('underscore');
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

class Session {

	constructor(){
	
	}
	
	getSession(id){
	
		return new Promise((resolve, reject) => {
				
			var params = {
				TableName: process.env.sessions_table,
				KeyConditionExpression: 'id = :idv',
				ExpressionAttributeValues: {':idv': id}
			};
	
			console.log(params);
			dynamodb.query(params, function(err, data) {
				console.log(err);
				if(_.isError(err)){
					
					return reject(err);
				}
				console.log('here3');
				if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
					console.log(data.Items);
					return resolve(data.Items);
				}
		
			});
			
        });
		
	}
	
}

module.exports = new Session();
