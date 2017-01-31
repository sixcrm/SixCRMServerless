'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

var rebillController = require('../../controllers/Rebill.js');

module.exports.pickrebill = (event, context, callback) => {
	
	var now = timestamp.createTimestampSeconds();
	
	rebillController.getRebillsAfterTimestamp(now).then((rebills) => {
		
		Promise.all(rebills.map(rebill => rebillController.sendMessageAndMarkRebill(rebill))).then((values) => {
			
			lr.issueResponse(200, {
				message: 'Success'
			}, callback); 
			
		}).catch((error) => {
			
			lr.issueError(error, 500, event, error, callback);
			
		});
	
	}).catch((error) => {
		lr.issueError(error, 500, event, error, callback);
	});      

}

