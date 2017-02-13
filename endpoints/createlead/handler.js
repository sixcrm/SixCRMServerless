'use strict';
var lr = require('../../lib/lambda-response.js');
var createLeadController = require('../../controllers/endpoints/createLead.js');

module.exports.createlead = (event, context, callback) => {
	
	createLeadController.execute(event).then((resp) => {
		return lr.issueResponse(200, {
			message: 'Success',
			results: resp
		}, callback);
	}).catch((error) =>{
		return lr.issueError(error.message, 500, event, error, callback);
	});
	
};
