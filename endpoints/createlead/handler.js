'use strict';
const jwt = require('jsonwebtoken');
const post_validator = require('post_validator');
var AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const _ = require("underscore");

module.exports.createlead = (event, context, callback) => {
	
	
	/*
	* Response object
	*/
	const lambda_response = {
		statusCode: 500,
		headers: {
        	"Access-Control-Allow-Origin" : "*"
      	},
		body: JSON.stringify({
			message: 'Something strange happened.  Please contact the system administrator.',
			input: event,
		}),
	};
	
	/*
	* TRANSCRIPTION 
	* Because of the way that Serverless handles events and the need to test locally this section has been added.
	*/
	
	var duplicate_body;
	try {
    	duplicate_body = JSON.parse(event['body']);
	} catch (e) {
		duplicate_body = event.body;
	}
	
	

	post_validator.validate(duplicate_body, validation_settings, function(input_object, missing_fields, validation_errors){
		
		//conditionally create error response from missing_fields and validation_errors
		if(validation_errors.length > 0 || missing_fields.length > 0){
		
			var error_response = {
				'validation_errors':validation_errors,
				'missing_fields': missing_fields
			};		
		
			lambda_response['body'] = JSON.stringify({
				message: 'One or more validation errors occurred.',
				input: event,
				errors: error_response
			});

			callback(null, lambda_response);
		
		}
		
		// verify the site token
		jwt.verify(input_object['site_token'], process.env.site_secret_key, function(err, decoded) {
			
			if(_.isError(err)){
				var error_response = {'validation_errors':['Could not verify site token.  Please contact the system administrator.']};		
				lambda_response['body'] = JSON.stringify({
					message: 'One or more validation errors occurred.',
					input: event,
					errors: error_response
				});
				callback(null, lambda_response);
			}
			
			if(!_.isObject(decoded) || !_.has(decoded, "body")){
				var error_response = {'validation_errors':['Unable to decode site token.']};		
				lambda_response['body'] = JSON.stringify({
					message: 'One or more validation errors occurred.',
					input: event,
					errors: error_response
				});
				callback(null, lambda_response);
			}

			var decoded_body = JSON.parse(decoded.body);
			
			if(!_.has(decoded_body,"site_client_id")){
				var error_response = {'validation_errors':['Unable to acquire site_client_id from token.']};		
				lambda_response['body'] = JSON.stringify({
					message: 'One or more validation errors occurred.',
					input: event,
					errors: error_response
				});
				callback(null, lambda_response);
			}
			
			var site_client_id = parseInt(decoded_body['site_client_id']);
			/*
			* Client and Campaign validation 
			* Connect to dynamoDB to validate that the client and the campaign are still marked active.
			*/
			
			var params = {
				TableName: process.env.dynamo_table,
				KeyConditionExpression: 'client_id = :client_idv',
				ExpressionAttributeValues: {
					':client_idv': site_client_id
				}
			};
		 
			dynamodb.query(params, function(err, data) {
			
				if (_.isError(err)) {	
					var error_response = {'validation_errors':['Unable to connect to database.']};		
					lambda_response['body'] = JSON.stringify({
						message: 'Database Error',
						input: event,
						errors: error_response
					});
					callback(null, lambda_response);
				 }
				
				if(!_.isObject(data) || !_.has(data,'Items') || !_.isArray(data.Items) || data.Items.length < 1){
					var error_response = {'validation_errors':['Unable to locate Client ID.']};		
					lambda_response['body'] = JSON.stringify({
						message: 'Validation Error',
						input: event,
						errors: error_response
					});
					callback(null, lambda_response);
				}
				
				data.Items.forEach(function(item){
					
					if(!_.has(item, "client_id")){
						
						var error_response = {'validation_errors':['Unable to locate Client ID.']};		
						lambda_response['body'] = JSON.stringify({
							message: 'Validation Error',
							input: event,
							errors: error_response
						});
						callback(null, lambda_response);
					
					}
					
					if(!_.has(item,"active")){
					
						var error_response = {'validation_errors':['Unable to locate Client ID Active Setting']};		
						lambda_response['body'] = JSON.stringify({
							message: 'Validation Error',
							input: event,
							errors: error_response
						});
						callback(null, lambda_response);
					}
					
					if(item.active !== true){
						var error_response = {'validation_errors':['Client ID is not active.']};		
						lambda_response['body'] = JSON.stringify({
							message: 'Validation Error',
							input: event,
							errors: error_response
						});
						callback(null, lambda_response);
					}
					
					if(!_.has(item, "campaigns") || !_.isArray(item.campaigns) || item.campaigns.length < 1){
						var error_response = {'validation_errors':['Unable to locate Campaign ID.']};		
						lambda_response['body'] = JSON.stringify({
							message: 'Validation Error',
							input: event,
							errors: error_response
						});
						callback(null, lambda_response);
					}
					
					var campaign_found = false;
					for (var i = 0, len = item.campaigns.length; i < len; i++) {
						if(_.has(item.campaigns[i], "id") && item.campaigns[i].id == decoded_body['site_campaign_id']){
							campaign_found = true;
							if(!_.has(item.campaigns[i], "active") || item.campaigns[i].active == false){
								var error_response = {'validation_errors':['Campaign ID is not active.']};		
								lambda_response['body'] = JSON.stringify({
									message: 'Validation Error',
									input: event,
									errors: error_response
								});
								callback(null, lambda_response);
							}
						}
					}
				
					if(campaign_found == false){
						var error_response = {'validation_errors':['Unable to locate Campaign ID.']};		
						lambda_response['body'] = JSON.stringify({
							message: 'Validation Error',
							input: event,
							errors: error_response
						});
						callback(null, lambda_response);
					}
					
				});
				
				//create the JWT expiration
				// +7 days
				var dateTime = new Date().getTime();
				var timestamp = Math.floor(dateTime / 1000) + (60 * 60 * 24 * 7);
			
				//build the JWT payload
				var payload = {
					body: JSON.stringify({
						site_campaign_id: decoded_body['site_campaign_id'],
						site_client_id: decoded_body['site_client_id'],
						site_product_id: decoded_body['site_product_id'],
						site_product_quantity:decoded_body['site_product_quantity'],
						site_product_price:decoded_body["site_product_price"],
						site_product_ship_price:decoded_body["site_product_ship_price"],
						site_referring_url: input_object['site_referring_url'],
						client_ip_address: input_object['client_ip_address']
					}),
					iat: timestamp
				}
			
				//get the JWT	
				var created_token = jwt.sign(payload, process.env.user_secret_key);
		
				lambda_response.statusCode = 200;
				lambda_response['body'] = JSON.stringify({
					message: 'Success',
					token: created_token
				});
	
				callback(null, lambda_response);
				
			});
			
		
		});
		
		
	});

};
