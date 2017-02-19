'use strict';
var lr = require('../../lib/lambda-response.js');

var pickRebillController = require('../../controllers/workers/pickRebill.js');

module.exports.pickrebill = (event, context, callback) => {
	
	pickRebillController.execute().then((result) => {
			
		lr.issueResponse(200, {
			message: result
		}, callback);
		
	}).catch((error) =>{
	
		return lr.issueError(error.message, 500, event, error, callback);
		
	});

}

