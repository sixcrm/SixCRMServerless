
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

module.exports = class ShippingCarrierController {

	constructor(){

		let parameter_validation = {}

		let parameter_definition = {};

		const ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new ParametersController({
			validation: parameter_validation,
			definition: parameter_definition
		});

	}

	augmentParameters(){

		du.debug('Augment Parameters');

		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	setParameters(parameters_object){

		du.debug('Set Parameters');

		this.parameters.setParameters(parameters_object);

		return Promise.resolve(true);

	}

	respond({additional_parameters}){

		du.debug('Respond');

		let vendor_response = this.parameters.get('vendorresponse');
		let action = this.parameters.get('action');

		const VendorResponseClass = global.SixCRM.routes.include('vendors', 'shippingcarriers/'+this.getVendorName()+'/Response.js');

		let response_object = {vendor_response: vendor_response, action: action};

		if(!_.isNull(additional_parameters) && !_.isUndefined(additional_parameters)){
			response_object['additional_parameters'] = additional_parameters;
		}

		return new VendorResponseClass(response_object);

	}

	getVendorName(){

		return objectutilities.getClassName(this).replace('Controller', '');

	}

}
