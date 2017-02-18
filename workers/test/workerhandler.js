'use strict';
var AWS = require("aws-sdk");
const _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var sqs = require('../../lib/sqs-utilities.js');
var lambda = require('../../lib/lambda-utilities.js');

module.exports.test = (event, context, callback) => {
	
	var message = event;
		
	console.log(message);
	
	lambda.invokeFunction({function_name: process.env.workerfunction, payload: JSON.stringify(message)}, (error, workerdata) => {
		
		console.log('Error:');
		console.log(error);
		
		console.log('Workerdata:');
		console.log(workerdata);	
				
		lr.issueResponse(200, {
			message: 'Success'
		}, callback);
			
	});

}
