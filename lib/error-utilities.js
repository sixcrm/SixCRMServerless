'use strict'
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const stringutilities = global.routes.include('lib', 'string-utilities.js');

module.exports = new class ErrorUtilities {

    constructor(){

        //Note:  Graph is dumb and needs the error names to match the error class names
        this.error_types  = {
          'forbidden':class ForbiddenError extends Error {
              constructor(message){
                  super(message);
                  this.name = 'Forbidden Error';
                  this.message = 'User is not authorized to perform this action.';
                  this.code = 403;
                  this.someotherfield = 403;
              }
        },
            'not_implemented': class NotImplementedError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Not Implemented Error';
                    this.message = 'Not Implemented.';
                    this.code = 501;
                }
        },
            'not_found': class NotFoundError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Not Found Error';
                    this.message = 'Not found.';
                    this.code = 404;
                }
        },
            'server': class ServerError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Server Error';
                    this.message = 'Internal Server Error';
                    this.code = 500;
                }
        },
            'bad_request':class BadRequestError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Bad Request Error';
                    this.message = 'Bad Request Error';
                    this.code = 400;
                }
        },
            'validation':class ForbiddenError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Validation';
                    this.message = 'Validation failed.';
                    this.code = 500;
                }
        },
        };
    }

    throwError(type, message, additional_properties){


        if(_.isUndefined(type)){
            type = 'server';
        }

        let an_error = this.getError(type, message, additional_properties);

        throw an_error;

    }

    getError(type, message, additional_properties){

        let error = this.getErrorType(type)

        if(!_.isUndefined(message)){

            error.message = message;

        }

        if(!_.isUndefined(additional_properties) && _.isObject(additional_properties)){
            for(var key in additional_properties){
                error[key] = additional_properties[key];
            }
        }

        return error;

    }

    getErrorType(type){

        let e = new this.error_types['server'];

        if(_.has(this.error_types, type)){

            let e = new this.error_types[type];

            return e;

        }

        return e;

    }

    getErrorByName(name){

      for (var key in this.error_types) {

        let function_name = stringutilities.removeNonAlphaNumeric(this.error_types[key].name).toLowerCase();

        let graph_name = stringutilities.removeNonAlphaNumeric(name).toLowerCase();

        if(stringutilities.removeNonAlphaNumeric(this.error_types[key].name).toLowerCase() == stringutilities.removeNonAlphaNumeric(name).toLowerCase()){

          return new this.error_types[key];

        }

      }

      return null;

    }

}
