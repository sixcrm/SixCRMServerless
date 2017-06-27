'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

class LambdaResponse {

    constructor(){

        this.lambda_response = {
            statusCode: 500,
            headers: {
        		    "Access-Control-Allow-Origin" : "*"
      		  },
            body: JSON.stringify(this.createResponseBody(false, 500, null, 'Server Error', 'Internal Service Error.'))
        };

    }

    createResponseBody(success, code, data, error_type, message){

        let response_object = {
          success: success,
          code: code,
          data: data
        };

        if(!_.isUndefined(error_type) && !_.isNull(error_type)){

          response_object.error_type = error_type;

        }

        if(!_.isUndefined(message) && !_.isNull(message)){

          response_object.message = message;

        }

        return response_object;

    }

    issueSuccess(result, callback, message){

      let code = 200;

      let response_object = this.createResponseBody(true, code, result, null, message);

      return this.issueResponse(code, response_object, callback);

    }

    issueError(error, event, callback){

        let code = 500;

        if(_.has(error, 'code')){

            code = error.code;

        }

        let message = 'Internal Server Error.';

        if(_.has(error, 'message')){

            message = error.message;

        }

        let issues = null;

        if(_.has(error, 'issues')){

            issues = error.issues;

        }

        let type = 'Server Error';

        if(_.has(error, 'name')){
          type = error.name;
        }

        let response_object = this.createResponseBody(false, code, null, type, message);

        if(!_.isNull(issues)){
            response_object['issues'] = issues;
        }

        return this.issueResponse(code, response_object, callback);

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
