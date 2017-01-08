'use strict';
const _ = require("underscore");

module.exports.createlead = (event, context, callback) => {
	
	var lambda_response = {};		
	lambda_response.statusCode = 200;
	lambda_response['body'] = JSON.stringify({
		message: 'Success'
	});

	callback(null, lambda_response);
				
};
