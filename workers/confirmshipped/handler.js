'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');

module.exports.confirmshipped = (event, context, callback) => {
    
    console.log(event);
    console.log(context);
	//this is where the fulfillment provider contacts us and puts the message in "shipped" status...
	//note that this may just be a thing where the record is marked and all we do is query the record and check it's status
	//don't execute the associated method every minute
    	
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}