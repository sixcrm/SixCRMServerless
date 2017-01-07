'use strict';
const jwt = require('jsonwebtoken');
var AWS = require("aws-sdk");
const _ = require("underscore");

module.exports.acquiretoken = (event, context, callback) => {
	
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
	
	var timestamp = new Date().getTime(); + (60 * 60);

	var payload = {
		body: JSON.stringify({}),
		iat: timestamp
	}
	
	var created_token = jwt.sign(payload, 'abc123');

	lambda_response.statusCode = 200;
	lambda_response['body'] = JSON.stringify({
		message: 'Success',
		token: created_token
	});

	callback(null, lambda_response);

}