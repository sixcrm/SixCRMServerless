'use strict';
var lr = require('../../lib/lambda-response.js');
var shipProductController = require('../../controllers/workers/shipProduct.js');

module.exports.shipproduct = (event, context, callback) => {
	
	shipProductController.execute(event).then((shipped) => {
		
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