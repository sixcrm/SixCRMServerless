'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const request = require('request');
const querystring = require('querystring');

module.exports.createorder= (event, context, callback) => {

    var lambda_response = {};

    lambda_response.statusCode = 500;
    lambda_response['body'] = JSON.stringify({
        message: 'An unexpected error occured.'
    });

    var duplicate_body;

    try {
    	duplicate_body = JSON.parse(event['body']);
    } catch (e) {
        duplicate_body = event.body;
    }

    var orderjson;

    try{
        orderjson = JSON.parse(fs.readFileSync('./endpoints/createorder/schema/order.json','utf8'));
    } catch(e){
        console.log(e); // eslint-disable-line no-console
        lambda_response.body = JSON.stringify(
			{message: 'Unable to load schema'}
		);
        callback(null, lambda_response)
    }

    var validation;

    try{
        var v = new Validator();

        validation = v.validate(duplicate_body, orderjson);
    }catch(e){
        lambda_response.body = JSON.stringify(
			{message: e.message}
		);
        callback(null, lambda_response);
    }

    if(validation['errors'].length > 0){
        let error_response = {'validation_errors':validation['errors']};

        lambda_response['body'] = JSON.stringify({
            message: 'One or more validation errors occurred.',
            input: event,
            errors: error_response
        });
        callback(null, lambda_response);
    }

    validation.errors = [];

    if(_.has(duplicate_body, 'email') && !validator.isEmail(duplicate_body['email'])){

        validation.errors.push('"email" field must be a email address.');

    }

    if(_.has(duplicate_body, 'shipping_email') && !validator.isEmail(duplicate_body['shipping_email'])){

        validation.errors.push('"shipping_email" field must be a email address.');

    }

	/*
	if(_.has(duplicate_body, 'ccnumber') && !validator.isCreditCard(duplicate_body['ccnumber'])){

		validation.errors.push('"ccnumber" must be a credit card number.');

	}
	*/

    if(_.has(duplicate_body, 'shipping') && !validator.isCurrency(duplicate_body['shipping'])){

        validation.errors.push('"shipping" must be a currency amount.');

    }

    if(_.has(duplicate_body, 'tax') && !validator.isCurrency(duplicate_body['tax'])){

        validation.errors.push('"tax" must be a currency amount.');

    }

    duplicate_body['username'] = 'demo'; //config
    duplicate_body['password'] = 'password'; //config

    if(validation['errors'].length > 0){
        let error_response = {'validation_errors':validation['errors']};

        lambda_response['body'] = JSON.stringify({
            message: 'One or more validation errors occurred.',
            input: event,
            errors: error_response
        });
        callback(null, lambda_response);
    }

    var request_options = {
	  headers: {'content-type' : 'application/x-www-form-urlencoded'},
	  url:     'https://secure.networkmerchants.com/api/transact.php', //config
	  body:    querystring.stringify(duplicate_body)
    };

    console.log(request_options); // eslint-disable-line no-console

    request.post(request_options, (error, response, body) => {
        if(_.isError(error)){

            console.log(error); // eslint-disable-line no-console

        }

        lambda_response.statusCode = 200;
        lambda_response['body'] = JSON.stringify({
            message: 'Success',
            results:body
        });
        callback(null, lambda_response);
    });

};
