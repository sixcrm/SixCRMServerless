'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var createLeadController = require('../../controllers/endpoints/createLead.js');

module.exports.createlead = (event, context, callback) => {
	
	createLeadController.execute(event).then((response) => {
		return new LambdaResponse().issueResponse(200, {
			message: 'Success',
			results: response
		}, callback);
	}).catch((error) =>{
		return new LambdaResponse().issueError(error.message, 500, event, error, callback);
	});
	
};