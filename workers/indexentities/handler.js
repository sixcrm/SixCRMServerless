'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var indexEntitiesController = require('../../controllers/workers/indexEntities.js');
const du = require('../../lib/debug-utilities.js');

module.exports.indexentities = (event, context, callback) => {
	
	indexEntitiesController.execute(event).then((result) => {
		
		if(result !== indexEntitiesController.messages.success && result !== indexEntitiesController.messages.successnoaction){
			
			new LambdaResponse().issueResponse(200, {
				message: result
			}, callback);
			
		}else{
			
			indexEntitiesController.createForwardMessage(event).then((forward_object) => {
				new LambdaResponse().issueResponse(200, {
					message: result,
					forward: forward_object
				}, callback);
			});
			
		}
	
	}).catch((error) => {
	
		return new LambdaResponse().issueError(error.message, 500, event, error, callback);
	
	});
	
}