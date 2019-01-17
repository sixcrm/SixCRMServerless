const _ = require('lodash');
const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class ShippingCarrierUtilities {

	constructor(){

		this.parameter_validation = {
			'instantiatedshippingcarrierprovider': global.SixCRM.routes.path('model', 'helpers/shippingcarriers/instantiatedshippingcarrierprovider.json'),
			'shippingreceipt':global.SixCRM.routes.path('model', 'entities/shippingreceipt.json')
		};

		this.parameter_definition = {};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

	}

	augmentParameters(){
		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	instantiateShippingCarrierProviderClass(){
		let shipping_receipt = this.parameters.get('shippingreceipt');

		const ShippingCarrierController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/'+shipping_receipt.tracking.carrier+'/handler.js');

		let shippingCarrierController = new ShippingCarrierController();

		this.parameters.set('instantiatedshippingcarrierprovider', shippingCarrierController);

		return true;

	}

	validateResponse(){
		if(_.has(this, 'response_validation')){

			let vendor_response = this.parameters.get('vendorresponseclass');

			let parsed_response = vendor_response.getParsedResponse();

			global.SixCRM.validate(parsed_response, this.response_validation);

			return true;

		}

		return false;

	}

	pruneResponse(){
		let vendor_response_class = this.parameters.get('vendorresponseclass');

		vendor_response_class.parameters.unset('vendorresponse');
		vendor_response_class.parameters.unset('response');

		this.parameters.set('vendorresponseclass', vendor_response_class);

		return true;

	}

}
