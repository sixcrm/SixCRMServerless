'use strict';
var lr = require('../../lib/lambda-response.js');
var confirmShippedController = require('../../controllers/workers/confirmShipped.js');

module.exports.confirmshipped = (event, context, callback) => {
	
	confirmShippedController.execute(event).then((shipped) => {
		
		if(shipped !== 'SHIPPED'){
			
			lr.issueResponse(200, {
				message: shipped
			}, callback);
			
		}else{
				
			lr.issueResponse(200, {
				message: shipped,
				forward: event
			}, callback);
			
		}
		
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}