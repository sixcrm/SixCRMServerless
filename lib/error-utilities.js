'use strict'
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = new class ErrorUtilities {

    constructor(){

        this.error_types  = {
            'forbidden':class ForbiddenError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Forbidden';
                    this.message = 'User is not authorized to perform this action.';
                    this.code = 403;
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
                    this.name = 'Server';
                    this.message = 'Internal Server Error';
                    this.code = 500;
                }
        },
            'bad_request':class BadRequestError extends Error {
                constructor(message){
                    super(message);
                    this.name = 'Bad Request';
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

        let error = this.getError(type, message, additional_properties);

        throw error;

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

        if(_.has(this.error_types, type)){

            return new this.error_types[type];

        }

        return new this.error_types['server'];

    }

}
