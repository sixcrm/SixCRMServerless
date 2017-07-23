'use strict';
const _ = require('underscore');
const request = require('request');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class NMIController {

    constructor(parameters){
        if(_.isObject(parameters)){
            if(_.has(parameters, "username")){
                this.username = parameters.username;
            }
            if(_.has(parameters, "password")){
                this.password = parameters.password;
            }
            if(_.has(parameters, "endpoint")){
                this.endpoint = parameters.endpoint;
            }
        }
    }

    refund(parameters){

        du.debug('Refund');

        return new Promise((resolve, reject) => {

            parameters = this.appendCredentials(parameters);

            var request_options = {
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                url:     this.endpoint,
                body:    querystring.stringify(parameters)
            };

            request.post(request_options, (error, response, body) => {

                if(_.isError(error)){
                    reject(error);
                }

                var response_body = querystring.parse(body);

                if(_.isObject(response_body) && _.has(response_body, "response")){

                    var resolve_object = {
                        message: '',
                        results: response_body
                    };

                    switch(response_body.response){

                    case '1':

                        resolve_object.message = 'Success';
                        break;

                    case '2':

                        resolve_object.message = 'Declined';
                        break;

                    case '3':

                        resolve_object.message = 'Error';
                        break;

                    default:
                        //do nothing...
                        break;

                    }

                    return resolve(resolve_object);

                }else{

                    eu.throwError('server', 'Unexpected Error posting to NMI.');

                }

            });

        });

    }

    void(parameters){

        du.debug('Void');

        return new Promise((resolve, reject) => {

            parameters = this.appendCredentials(parameters);

            var request_options = {
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                url:     this.endpoint,
                body:    querystring.stringify(parameters)
            };

            request.post(request_options, (error, response, body) => {

                if(_.isError(error)){
                    reject(error);
                }

                var response_body = querystring.parse(body);

                if(_.isObject(response_body) && _.has(response_body, "response")){

                    var resolve_object = {
                        message: '',
                        results: response_body
                    };

                    switch(response_body.response){

                    case '1':

                        resolve_object.message = 'Success';
                        break;

                    case '2':

                        resolve_object.message = 'Declined';
                        break;

                    case '3':

                        resolve_object.message = 'Error';
                        break;

                    default:
                        //do nothing...
                        break;

                    }

                    return resolve(resolve_object);

                }else{

                    eu.throwError('server','Unexpected Error posting to NMI.');

                }

            });

        });

    }

    process(parameters_array){

        du.debug('Process');

        return new Promise((resolve, reject) => {

          //validate parameters here!

            var parameter_group = this.createParameterGroup(parameters_array);

            var request_options = {
      			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
      			  url:     this.endpoint,
      			  body:    querystring.stringify(parameter_group)
            };


            request.post(request_options, (error, response, body) => {

                if(_.isError(error)){
                    reject(error);
                }

                var response_body = querystring.parse(body);

                if(_.isObject(response_body) && _.has(response_body, "response")){

                    var resolve_object = {
                        message: '',
                        results: response_body
                    };

                    switch(response_body.response){

                    case '1':

                        resolve_object.message = 'Success';
                        break;

                    case '2':

                        resolve_object.message = 'Declined';
                        break;

                    case '3':
                    default:

                        resolve_object.message = 'Error';
                        break;

                    }

                    resolve(resolve_object);

                }else{

                    eu.throwError('server','Unexpected Error posting to NMI.');

                }

            });

        });

    }

    appendCredentials(parameters){

        du.debug('Append Credentials');

        if(_.has(this, 'username')){
            parameters.username = this.username;
        }

        if(_.has(this, 'password')){
            parameters.password = this.password;
        }

        return parameters;

    }

    createParameterGroup(parameters){

        du.debug('Create Parameter Group');
		//need to enforce a contract here...

        var return_object = {};

		//authentication
        return_object.username = this.username;
        return_object.password = this.password;

		//operation type
        return_object.type = 'sale';

		//personal
        return_object.firstname = parameters.customer.firstname;
        return_object.lastname = parameters.customer.lastname;

		//creditcard
        return_object.ccnumber = parameters.creditcard.number;
        return_object.ccexp = parameters.creditcard.expiration;
        return_object.ccv = parameters.creditcard.ccv;
        return_object.amount = parameters.amount;

		//billing address
        return_object.address1 = parameters.creditcard.address.line1;
        return_object.city = parameters.creditcard.address.city;
        return_object.state = parameters.creditcard.address.state;
        return_object.zip = parameters.creditcard.address.zip;
        return_object.country = parameters.creditcard.address.country;
        if(_.has(parameters.creditcard.address, "line2")){
            return_object.address2 = parameters.creditcard.address.line2;
        }

		//shipping address
        return_object.shipping_address1 = parameters.customer.address.line1;
        return_object.shipping_city = parameters.customer.address.city;
        return_object.shipping_state = parameters.customer.address.state;
        return_object.shipping_zip = parameters.customer.address.zip;
        return_object.shipping_country = parameters.customer.address.country;
        if(_.has(parameters.customer.address, "line2")){
            return_object.shipping_address2 = parameters.customer.address.line2;
        }

        return return_object;

    }

}

module.exports = NMIController;
