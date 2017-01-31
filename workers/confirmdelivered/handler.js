'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');

module.exports.confirmdelivered = (event, context, callback) => {
    
    console.log(event);
    console.log(context);
    //check with USPS to make sure that the thing has been delivered.
    
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}