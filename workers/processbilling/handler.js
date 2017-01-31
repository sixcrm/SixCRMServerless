'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');

module.exports.processbilling = (event, context, callback) => {
    
    //note we need the session...
    console.log(event);
    
    //execute billing
    	
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}