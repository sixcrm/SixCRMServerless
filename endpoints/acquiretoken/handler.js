'use strict';
var lr = require('../../lib/lambda-response.js');
var acquireTokenController = require('../../controllers/endpoints/acquireToken.js');

module.exports.acquiretoken = (event, context, callback) => {
	
	acquireTokenController.execute(event).then((response) => {
		return lr.issueResponse(200, {
			message: 'Success',
			token: response
		}, callback);
	}).catch((error) =>{
		return lr.issueError(error.message, 500, event, error, callback);
	});

}