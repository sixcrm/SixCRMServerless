'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
const du = require('../../lib/debug-utilities.js');
let searchController = require('../../controllers/endpoints/search.js');

module.exports.search = (event, context, callback) => {
	
	du.debug('Event', event);
	searchController.execute(event).then((result) => {
		return new LambdaResponse().issueResponse(200, result, callback);
	}).catch((error) =>{
		return new LambdaResponse().issueError(error, 500, event, error, callback);
	});
	
}