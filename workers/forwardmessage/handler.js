'use strict';
var lr = require('../../lib/lambda-response.js');
var forwardMessageController = require('../../controllers/workers/forwardMessage.js');

module.exports.forwardmessage = (event, context, callback) => {
	
	forwardMessageController.execute().then((response) => {
			
		lr.issueResponse(200, {
			message: response
		}, callback);
		
	}).catch((error) =>{
	
		lr.issueError(error.message, 500, event, error, callback);
		
	});
	
}