'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
const du = require('../../lib/debug-utilities.js');
let suggestController = require('../../controllers/endpoints/suggest.js');

module.exports.suggest = (event, context, callback) => {
	
	du.debug('Event', event);
	
	suggestController.execute(event).then((result) => {
		return new LambdaResponse().issueResponse(200, result, callback);
	}).catch((error) =>{
		return new LambdaResponse().issueError(error, 500, event, error, callback);
	});
	
}