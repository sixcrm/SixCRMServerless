'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');


module.exports.pickrebill = (event, context, callback) => {
    
   //find stuff from the dynamodatabase that are ready for rebill
   
   //throw message in the bill queue
    	
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}