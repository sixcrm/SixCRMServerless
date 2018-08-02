
const _ = require('lodash');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class Response {

	constructor(){}

	initialize(){

		this.setResponseTypes();
		this.setParameterDefinition();
		this.setParameterValidation();

		this.parameters = new Parameters({
			validation: this.merged_parameter_validation,
			definition: this.merged_parameter_definition
		});

	}

	setResponseTypes(){
		if(_.has(this, 'response_types')){
			this.merged_response_types = objectutilities.merge(this.getImmutableResponseTypes(), this.response_types);
		}else{
			this.merged_response_types = this.getImmutableResponseTypes();
		}
	}

	setParameterDefinition(){
		if(_.has(this, 'parameter_definition')){
			this.merged_parameter_definition = objectutilities.merge(this.getImmutableParameterDefinition(), this.parameter_definition);
		}else{
			this.merged_parameter_definition = this.getImmutableParameterDefinition();
		}
	}

	setParameterValidation(){
		if(_.has(this, 'parameter_validation')){
			this.merged_parameter_validation = objectutilities.merge(this.getImmutableParameterValidation(), this.parameter_validation);
		}else{
			this.merged_parameter_validation = this.getImmutableParameterValidation();
		}
	}

	getImmutableResponseTypes(){
		return {
			success:{
				code: 'success'
			},
			fail:{
				code: 'fail'
			},
			decline:{
				code: 'decline'
			},
			noaction:{
				code: 'noaction'
			},
			error: {
				code: 'error'
			}
		};
	}

	getImmutableParameterValidation(){
		return {
			response_type: global.SixCRM.routes.path('model', 'general/response/responsetype.json')
		};
	}

	getImmutableParameterDefinition(){
		return {};
	}

	setResponse(response_type){
		this.parameters.set('response_type', response_type);
	}

	getCode(){

		let response_type = this.parameters.get('response_type', {fatal: false});

		if(objectutilities.hasRecursive(this, 'merged_response_types.'+response_type+'.code')){
			return this.merged_response_types[response_type].code;
		}

		return null;

	}

}
