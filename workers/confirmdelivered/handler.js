'use strict';
var lr = require('../../lib/lambda-response.js');
var confirmDeliveredController = require('../../controllers/workers/confirmDelivered.js');

module.exports.confirmdelivered = (event, context, callback) => {
	
	confirmDeliveredController.execute(event).then((delivered) => {
		
		if(delivered !== true){
			
			lr.issueResponse(200, {
				message: delivered.parsed_status
			}, callback);
			
		}else{
			
			lr.issueResponse(200, {
				message: 'DELIVERED',
				forward: event
			}, callback);
			
		}
		
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}