'use strict';
var lr = require('../../lib/lambda-response.js');
var archiveController = require('../../controllers/workers/archive.js');

module.exports.archive = (event, context, callback) => {
	
	archiveController.execute(event).then((response) => {
		
		if(response !== archiveController.messages.success){
			
			lr.issueResponse(200, {
				message: response
			}, callback);
			
		}else{
				
			lr.issueResponse(200, {
				message: response,
				forward: event
			}, callback);
			
		}
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}