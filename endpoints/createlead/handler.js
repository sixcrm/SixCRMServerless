'use strict';
const _ = require("underscore");

module.exports.createlead = (event, context, callback) => {
			
	lambda_response.statusCode = 200;
	lambda_response['body'] = JSON.stringify({
		message: 'Success',
		token: created_token
	});

	callback(null, lambda_response);
				
};
