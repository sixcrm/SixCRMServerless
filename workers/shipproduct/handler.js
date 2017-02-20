'use strict';
var lr = require('../../lib/lambda-response.js');
var shipProductController = require('../../controllers/workers/shipProduct.js');

module.exports.shipproduct = (event, context, callback) => {
	
	shipProductController.execute(event).then((shipped) => {
		
		if(shipped !== shipProductController.messages.notified){
			
			lr.issueResponse(200, {
				message: shipped.message
			}, callback);
			
		}else{

			shipProductController.createForwardMessage(event).then((forward_object) => {
				lr.issueResponse(200, {
					message: shipped ,
					forward: forward_object
				}, callback);
			});
			
		}
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}