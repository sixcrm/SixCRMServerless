
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

module.exports = class Parameters {

	constructor({validation, definition}){

		this.store = {};

		this.setParameterValidation({parameter_validation: validation});

		this.setParameterDefinition({parameter_definition: definition});

	}

	setParameterValidation({parameter_validation}){
		parameter_validation = _.isUndefined(parameter_validation)?{}:parameter_validation;

		if(!_.has(this, 'parameter_validation')){
			this.parameter_validation = {};
		}

		this.parameter_validation = objectutilities.merge(this.parameter_validation, parameter_validation);

		return true;

	}

	setParameterDefinition({parameter_definition}){
		parameter_definition = _.isUndefined(parameter_definition)?{}:parameter_definition;

		if(!_.has(this, 'parameter_definition')){
			this.parameter_definition = {};
		}

		this.parameter_definition = objectutilities.merge(this.parameter_definition, parameter_definition);

		return true;

	}

	push(key, value, valuekey){

		valuekey = (_.isNull(valuekey) || _.isUndefined(valuekey))?null:valuekey;

		if(!_.isNull(valuekey)){
			this.validate(valuekey, value);
		}

		if(_.has(this.store, key)){

			if(_.isArray(this.store[key])){

				this.store[key].push(value);

				return true;

			}

			throw eu.getError('server','"'+key+'" is not of type array.');

		}else{

			du.info('Exists');

			this.store[key] = [value];

		}

		return true;

	}

	set(key, value){

		if(this.validate(key, value)){

			this.store[key] = value;

		}

		return true;

	}

	unset(key){

		if(_.has(this.store, key)){

			delete this.store[key];

		}

	}

	getAll(){
		return this.store;

	}

	get(key, { fatal = true } = {}){

		let return_object = null;

		if(_.has(this.store, key)){

			return_object = this.store[key];

		}

		if(_.isNull(return_object) && fatal){
			throw eu.getError('server', '"'+key+'" property is not set.');
		}

		return return_object;

	}

	validate(key, value, fatal){

		fatal = (_.isUndefined(fatal))?true:fatal;

		if(_.has(this.parameter_validation, key)){

			return global.SixCRM.validate(value, this.parameter_validation[key], fatal);

		}else{

			du.warning('Missing Model: '+ key);

		}

		return true;

	}

	setParameters({argumentation: argumentation, action: action}){
		let local_parameters = {};

		if(objectutilities.hasRecursive(this, 'parameter_definition.'+action+'.required', true)){

			local_parameters = objectutilities.transcribe(this.parameter_definition[action].required, argumentation, local_parameters, true);

		}

		if(objectutilities.hasRecursive(this, 'parameter_definition.'+action+'.optional')){

			local_parameters = objectutilities.transcribe(this.parameter_definition[action].optional, argumentation, local_parameters);

		}

		objectutilities.map(local_parameters, local_parameter => {

			this.set(local_parameter, local_parameters[local_parameter]);

		});

		return true;

	}

	isSet(key){

		return (_.has(this.store, key));

	}

}
