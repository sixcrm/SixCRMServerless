'use strict';
var lr = require('../../lib/lambda-response.js');
var archiveController = require('../../controllers/workers/archive.js');

module.exports.archive = (event, context, callback) => {
	
	archiveController.execute(event).then((response) => {
		
		switch(response){
			
			case archiveController.messages.success:
				lr.issueResponse(200, {
					message: response,
					forward: forward_object
				}, callback);
				break;
				
			default:
				lr.issueResponse(200, {
					message: response
				}, callback);
				break;
				
		}
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}