'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var createOrderController = require('../../controllers/endpoints/createOrder.js');

module.exports.createorder= (event, context, callback) => {
	
	createOrderController.execute(event).then((response) => {
		return new LambdaResponse().issueResponse(200, {
			message: 'Success',
			results: response
		}, callback);
	}).catch((error) =>{
		return new LambdaResponse().issueError(error.message, 500, event, error, callback);
	});
	
};