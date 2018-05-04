const _ = require('lodash');

module.exports = new class ErrorUtilities {

	constructor(){

		this.error_codes = {
			403: 'forbidden',
			501: 'not_implemented',
			404: 'not_found',
			500: 'server',
			400: 'bad_request',
			520: 'control'
		};

		//Note:  Graph is dumb and needs the error names to match the error class names
		this.error_types  = {
			'forbidden':class ForbiddenError extends Error {
				constructor(message){
					super(message);
					this.name = 'Forbidden Error';
					this.message = '[403] User is not authorized to perform this action.';
					this.code = 403;
					this.someotherfield = 403;
				}
			},
			'not_implemented': class NotImplementedError extends Error {
				constructor(message){
					super(message);
					this.name = 'Not Implemented Error';
					this.message = '[501] Not Implemented.';
					this.code = 501;
				}
			},
			'not_found': class NotFoundError extends Error {
				constructor(message){
					super(message);
					this.name = 'Not Found Error';
					this.message = '[404] Not found.';
					this.code = 404;
				}
			},
			'server': class ServerError extends Error {
				constructor(message){
					super(message);
					this.name = 'Server Error';
					this.message = '[500] Internal Server Error';
					this.code = 500;
				}
			},
			'bad_request':class BadRequestError extends Error {
				constructor(message){
					super(message);
					this.name = 'Bad Request Error';
					this.message = '[400] Bad Request Error';
					this.code = 400;
				}
			},
			'validation':class ValidationError extends Error {
				constructor(message){
					super(message);
					this.name = 'Validation Error';
					this.message = '[500] Validation failed.';
					this.code = 500;
				}
			},
			'control':class ControlError extends Error {
				constructor(message){
					super(message);
					this.name = 'Control Error';
					this.message = '[520] Control Error';
					this.code = 520;
				}
			}
		};
	}

	throw(error){

		throw error;

	}

	getError(type, message, additional_properties){

		if(_.isUndefined(type)){
			type = 'server';
		}

		let error = this.getErrorType(type)

		if(!_.isUndefined(message)){

			error.message = '['+error.code+'] '+message;

		}

		if(_.isError(message) && _.has(message, 'message')){

			message = message.message.replace(/^\[\d{3}\]\s/g, "");

		}

		if(!_.isUndefined(additional_properties) && _.isObject(additional_properties)){
			for(var key in additional_properties){
				error[key] = additional_properties[key];
			}
		}

		return error;

	}

	getErrorType(type){

		let e = new this.error_types['server']();

		if(_.has(this.error_types, type)){

			let e = new this.error_types[type]();

			return e;

		}

		return e;

	}

	getErrorByName(name){

		for (var key in this.error_types) {

			let function_name = this.removeNonAlphaNumeric(this.error_types[key].name).toLowerCase();

			let graph_name = this.removeNonAlphaNumeric(name).toLowerCase();

			if(function_name == graph_name){

				return new this.error_types[key]();

			}

		}

		return null;

	}

	removeNonAlphaNumeric(string){

		return string.replace(/[^0-9a-z]/gi,'');

	}

	isError(thing){

		if(thing instanceof Error){
			return true;
		}

		return false;

	}

}()
