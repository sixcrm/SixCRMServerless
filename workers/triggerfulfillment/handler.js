'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');

module.exports.triggerfulfillment = (event, context, callback) => {
    
    console.log(event);
    console.log(context);
    
    // ping the fulfillment vendor
    
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}