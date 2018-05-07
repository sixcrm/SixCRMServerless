
const _ =  require('lodash');
const Ajv = require('ajv');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class ModelValidatorUtilities {

	static validationFunction(object, path_to_model){
		du.debug('Validate Function');

		const ajv = new Ajv({
			schemaId: 'auto',
			format: 'full',
			allErrors: true,
			verbose: true
		});

		ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

		delete require.cache[require.resolve(path_to_model)];
		let schema = require(path_to_model);

		let validation;

		try{

			this.loadReferencesRecursive(path_to_model, (schema, uri) => {

				this.ensureCorrectId(schema, uri);

				const correct_path = this.getCorrectPath(uri);

				if (!_.isUndefined(ajv.getSchema(correct_path))) {
					return;
				}


				ajv.addSchema(schema, correct_path);
			});

			validation = ajv.validate(schema, object);

		}catch(e){

			du.error(e);

			throw eu.getError('server','Unable to instantiate validator.');

		}

		return {
			valid: validation,
			root: schema.title,
			errors: ajv.errors
		};
	}

	static loadReferencesRecursive(path_to_model, parse_function, count) {

		count || (count = 0);
		du.debug(`Load References Recursive, [${count}]`);

		if (count++ > 10) {
			du.warning('Exceeding recursive reference limit, exiting.');
			return;
		}

		du.debug(`Looking for references in ${path_to_model}`);
		delete require.cache[require.resolve(path_to_model)];
		let schema = require(path_to_model);
		//du.debug(schema);

		let references_regex = /"\$ref":\s*"([0-9a-zA-Z./\-_]+?)"/g;
		let references = this.getMatches(JSON.stringify(schema), references_regex, 1);

		du.debug(`Found ${references.length} reference(s).`);

		arrayutilities.map(references, (reference) => {

			du.debug(`Found reference to ${reference}`);

			let uri = reference;
			let path_to_schema = `${path_to_model.substring(0, path_to_model.lastIndexOf('/'))}/${uri}`;

			delete require.cache[require.resolve(path_to_schema)];
			let schema = require(path_to_schema);

			parse_function(schema, uri);

			this.loadReferencesRecursive(path_to_schema, parse_function, count);

		});

	}

	//Technical Debt:  This belong in the /lib directory
	static getMatches(string, regex, index) {
		index || (index = 1);
		let matches = [];
		let match;

		do {
			match = regex.exec(string);
			if (match) {
				matches.push(match[index]);
			}
		} while (match);

		return matches;
	}

	static validateModel(validation_object, path_to_model, validation_function, fatal){

		du.debug('Validate Model');

		if(_.isUndefined(validation_object)){
			throw eu.getError('server', 'Validation object must be defined.');
		}

		try {
			// Technical Debt: Without this validation can wrongfully pass for certain objects (for example when coming through graph). Figure out why.
			validation_object = JSON.parse(JSON.stringify(validation_object));
		} catch (error) {
			throw eu.getError('server','One or more validation errors occurred: Object to validate must be an object, got ' + typeof validation_object);
		}

		if(_.isUndefined(fatal)){
			fatal = true;
		}

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

	//Technical Debt: Finish this.
	/*
    static loadAssociatedModels(schema, validator){

        du.debug('loadAssociatedModels');

      //Technical Debt: Finish this.
      //get associated models from the schema.
      //add them to the schema

    }
    */

	/**
     * Alter the id of schema if needed.
     *
     * Schema validation library that we use requires that id of the schema is in correlation to it's path at the time
     * of loading. This method ensures that.
     *
     * @param schema Schema object
     * @param path   Path to schema.
     */
	static ensureCorrectId(schema, path) {

		let canonical_id = path.replace(/\.+\//g,'/').replace(/\/\/+/g,'/'); //remove relative paths

		if (canonical_id.length > schema.id.length) {
			schema.id = canonical_id;
		}

		if (path[0] === '.' && path[1] !== '.') {
			path = path.substr(1);
		}

	}

	static getCorrectPath(path) {
		if (path[0] === '.' && path[1] !== '.') { // No need for paths to start with dot when referencing a file in same directory.
			return path.substr(1);                // Technical Debt: figure out why this causes problems.
		}

		return path;
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
