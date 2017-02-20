'use strict';
var lr = require('../../lib/lambda-response.js');
var shipProductController = require('../../controllers/workers/shipProduct.js');

module.exports.shipproduct = (event, context, callback) => {
	
	shipProductController.execute(event).then((shipped) => {
		
		switch(shipped){
			
			case shipProductController.messages.notified:
				
				shipProductController.createForwardMessage(event).then((forward_object) => {
					lr.issueResponse(200, {
						message: shipped ,
						forward: forward_object
					}, callback);
				});
			
				break;
			
			case shipProductController.messages.failed:
				
				shipProductController.createForwardMessage(event).then((forward_object) => {
					lr.issueResponse(200, {
						message: shipped ,
						failed: forward_object
					}, callback);
				});
			
				break;
			
			case default:
				lr.issueResponse(200, {
					message: shipped.message
				}, callback);
				break;
			
		}
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}