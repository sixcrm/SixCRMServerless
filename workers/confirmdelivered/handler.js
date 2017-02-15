'use strict';
var AWS = require("aws-sdk");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();

var lr = require('../../lib/lambda-response.js');

module.exports.confirmdelivered = (event, context, callback) => {
	
	try{

		rebill_schema = require('../../model/rebill.json');

	} catch(e){

		callback(new Error('Unable to load validation schemas.'), null);

	}
	
	var validation;
	var params = JSON.parse(JSON.stringify(event));

	try{
		var v = new Validator();
		validation = v.validate(event, rebill_schema);
	}catch(e){
		callback(new Error('Unable to instantiate validator.'), null);
	}
	
	if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

		var error = {
			message: 'One or more validation errors occurred.',
			issues: validation.errors.map((e) => { return e.message; })
		};
		
		callback(error, null);

	}
	
	
	rebillController.getTransactions(event).then((transactions) => {
	
	});
    //get transactions
    	//for the products that are shippable
    		//get the shipping receipts
    			//foreach shipping receipt
    				//confirm that the object has a tracking id
    				//check with USPS to make sure that the thing has been delivered.
    				//if delivered, respond with rebill
    				
    //respond false
    
    
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}