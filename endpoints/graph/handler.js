'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');

let graphController = require('../../controllers/endpoints/graph.js');

module.exports.graph = (event, context, callback) => {
	
	graphController.execute(event).then((result) => {
		return new LambdaResponse().issueResponse(200, result, callback);
	}).catch((error) =>{
		return new LambdaResponse().issueError(error, 500, event, error, callback);
	});
	
}