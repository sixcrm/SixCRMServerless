'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');

var pickRebillController = require('../../controllers/workers/pickRebill.js');

module.exports.pickrebill = (event, context, callback) => {
	
	pickRebillController.execute().then((result) => {
			
		new LambdaResponse().issueResponse(200, {
			message: result
		}, callback);
		
	}).catch((error) =>{
	
		return new LambdaResponse().issueError(error.message, 500, event, error, callback);
		
	});

}

