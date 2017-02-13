'use strict';
var lr = require('../../lib/lambda-response.js');
var createOrderController = require('../../controllers/endpoints/createOrder.js');

module.exports.createorder= (event, context, callback) => {
	
	createOrderController.execute(event).then((response) => {
		return lr.issueResponse(200, {
			message: 'Success',
			results: response
		}, callback);
	}).catch((error) =>{
		return lr.issueError(error.message, 500, event, error, callback);
	});
	
};