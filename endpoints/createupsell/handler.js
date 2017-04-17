'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var createUpsellController = require('../../controllers/endpoints/createUpsell.js');

module.exports.createupsell= (event, context, callback) => {
	
	createUpsellController.execute(event).then((response) => {
		return new LambdaResponse().issueResponse(200, {
			message: 'Success',
			results: response
		}, callback);
	}).catch((error) =>{
		return new LambdaResponse().issueError(error.message, 500, event, error, callback);
	});
	
};