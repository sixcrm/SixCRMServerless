'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var forwardMessagesController = require('../../controllers/workers/forwardMessages.js');

module.exports.forwardmessages = (event, context, callback) => {
	
	forwardMessagesController.execute().then((response) => {
		
		new LambdaResponse().issueResponse(200, {
			message: response
		}, callback);
		
	}).catch((error) =>{
	
		new LambdaResponse().issueError(error.message, 500, event, error, callback);
		
	});
	
}