const _ =  require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const ajv = global.SixCRM.routes.include('controllers', 'providers/ajv-provider.js');

module.exports = class ModelValidatorUtilities {

	static validationFunction(object, path_to_model){
		du.debug('Validate Function');

		const schema = require(path_to_model);
		const validation = ajv.validate(schema.$id, object);

		return {
			valid: validation,
			root: schema.title,
			errors: ajv.errors
		};
	}

	static validateModel(validation_object, path_to_model, validation_function, fatal = true){

		du.debug('Validate Model');
		du.debug('Validation Object: ', validation_object);
		du.debug('Validation Model: '+path_to_model);

		let validation;

		if(_.isUndefined(validation_function) || _.isNull(validation_function)){

			validation_function = () => { return this.validationFunction(validation_object, path_to_model); }

		}else{

			if(!_.isFunction(validation_function)){

				throw eu.getError('server','Validation function is not a function.');

			}

		}

		validation = validation_function();

		if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

			du.debug(validation);

			if(fatal){

				return this.issueValidationError(validation);

			}else{

				return false;

			}

		}

		return this.issueValidationSuccess(validation);

	}

	static issueValidationSuccess(){

		du.debug('Issue Validation Success.');

		du.debug('Model is valid.');

		return true;

	}

	static issueValidationError(validation){

		du.debug('Issue Validation Error');

		du.info('Model is not valid.');

		du.warning(validation);

		throw eu.getError(
			'server',
			'One or more validation errors occurred: '+this.buildPrettyErrorMessage(validation),
			{issues: validation.errors.map(e => e.message)}
		);

	}

	static buildPrettyErrorMessage(validation){
		const {root} = validation;

		const error_messages = arrayutilities.map(validation.errors, validation_error => {
			const prefix = root ? `[${root}] ` : '';
			const data_path = validation_error.dataPath;
			const message = validation_error.message;

			return prefix + `instance${data_path} ${message}`;
		})

		return arrayutilities.compress(error_messages,', ','');

	}

}
