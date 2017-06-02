'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

class LambdaResponse {

    constructor(){
        this.lambda_response = {
            statusCode: 500,
            headers: {
        		    "Access-Control-Allow-Origin" : "*"
      		  },
            body:'An unexpected error occurred.'
        };

    }

    issueError(message, code, event, error, callback){

        let body = {message: message};

        if(_.isObject(message) && _.has(message, 'message')){
            body.message = message.message;
        }

        if(!_.has(body, 'message') || !body.message) {
            body.message = 'An unexpected error occurred.';
        }

        if(_.has(error, 'issues')){
            body.issues = error.issues;
        }

        return this.issueResponse(code, body, callback);

    }

    setResponseHeader(key, value){

        du.debug('Set Response Header');

        this.lambda_response.headers[key] = value;

    }

    //Note: Entrypoint
    setGlobalHeaders(parameter_object){

        du.debug('Set Global Header');

        this.assureGlobal();

        for(var k in parameter_object){

            this.setGlobalHeader(k, parameter_object[k]);

        }

    }

    assureGlobal(){

        if(!_.has(global, 'six_lambda_response_headers') || !_.isObject(global.six_lambda_response_headers)){

            global.six_lambda_response_headers = {};

        }

    }

    setGlobalHeader(key, value){

        if(_.isString(key) && _.isString(value)){

            global.six_lambda_response_headers[key] = value;

        }

    }

    setLambdaResponseHeaders(){

        if(_.has(global, 'six_lambda_response_headers') && _.isObject(global.six_lambda_response_headers)){

            for(var k in global.six_lambda_response_headers){

                this.setLambdaResponseHeader(k, global.six_lambda_response_headers[k]);

            }

        }

        this.truncateGlobalResponseHeaders();

    }

    setLambdaResponseHeader(key, value){

        if(_.isString(key) && _.isString(value)){

            this.lambda_response.headers[key] = value;

        }

    }

    truncateGlobalResponseHeaders(){

        global.six_lambda_response_headers = undefined;

    }

    issueResponse(code, body, callback)	{

        this.setLambdaResponseHeaders();

        if (code) {

            this.lambda_response.statusCode = code;

        }

        if (body) {

            if(_.isString(body)){

                this.lambda_response.body = body;

            }else{

                this.lambda_response.body = JSON.stringify(body);

            }

        }

        return callback(null, this.lambda_response)

    }

}

module.exports = LambdaResponse;
