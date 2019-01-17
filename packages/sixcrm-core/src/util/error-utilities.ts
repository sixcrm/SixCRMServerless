import * as _ from 'lodash';

// Note:  Graph is dumb and needs the error names to match the error class names
class SixError extends Error {
	code: number;

	constructor(message?: string) {
		super(message);
	}
}

// Not sure what's going on here with calling super(message) and then immediately replacing it.
class ForbiddenError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Forbidden Error';
		this.message = '[403] User is not authorized to perform this action.';
		this.code = 403;
	}
}

class NotImplementedError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Not Implemented Error';
		this.message = '[501] Not Implemented.';
		this.code = 501;
	}
}

class NotFoundError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Not Found Error';
		this.message = '[404] Not found.';
		this.code = 404;
	}
}

class ServerError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Server Error';
		this.message = '[500] Internal Server Error';
		this.code = 500;
	}
}

class BadRequestError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Bad Request Error';
		this.message = '[400] Bad Request Error';
		this.code = 400;
	}
}

class ValidationError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Validation Error';
		this.message = '[500] Validation failed.';
		this.code = 500;
	}
}

class ControlError extends SixError {
	constructor(message?: string) {
		super(message);
		this.name = 'Control Error';
		this.message = '[520] Control Error';
		this.code = 520;
	}
}

export default class ErrorUtilities {

	static error_types = {
		forbidden: ForbiddenError,
		not_implemented: NotImplementedError,
		not_found: NotFoundError,
		server: ServerError,
		bad_request: BadRequestError,
		validation: ValidationError,
		control: ControlError
	};

	static getError(type: string, message?, additional_properties?: object) {

		if (_.isUndefined(type)) {
			type = 'server';
		}

		const error = this.getErrorType(type);

		if (!_.isUndefined(message)) {

			error.message = '[' + error.code + '] ' + message;

		}

		if (_.isError(message) && _.has(message, 'message') && !_.isNull(message.message)) {

			message = message.message.replace(/^\[\d{3}\]\s/g, "");

		}

		if (additional_properties !== undefined && _.isObject(additional_properties)) {
			for (const key in additional_properties) {
				error[key] = additional_properties[key];
			}
		}

		return error;

	}

	static getErrorType(type) {

		const errorType: typeof SixError = this.error_types[type] || this.error_types.server;

		return new errorType();

	}

	static getErrorByName(name) {

		for (const key in this.error_types) {

			const function_name = this.removeNonAlphaNumeric(this.error_types[key].name).toLowerCase();

			const graph_name = this.removeNonAlphaNumeric(name).toLowerCase();

			if (function_name === graph_name) {

				return new this.error_types[key]();

			}

		}

		return null;

	}

	static removeNonAlphaNumeric(string) {

		return string.replace(/[^0-9a-z]/gi, '');

	}

	static isError(thing) {

		if (thing instanceof Error) {
			return true;
		}

		return false;

	}

}
