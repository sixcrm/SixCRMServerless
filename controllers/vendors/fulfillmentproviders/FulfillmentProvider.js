
const _ = require('lodash');
const uuidV4 = require('uuid/v4');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class fulfillmentProviderController {

	constructor(){

		this.parameter_validation = {
			'fulfillmentprovider':global.SixCRM.routes.path('model','entities/fulfillmentprovider.json')
		};

		this.parameter_definition = {
			construct:{
				required:{
					fulfillmentprovider: 'fulfillment_provider'
				},
				optional:{

				}
			}
		};

		this.parameters = new Parameters({definition: this.parameter_definition, validation: this.parameter_validation});

		this.parameters.setParameters({argumentation: arguments[0], action: 'construct'});

		this.search_fields = ['name'];

	}

	augmentParameters(){

		du.debug('Augment Parameters');

		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	respond({additional_parameters}){

		du.debug('Respond');

		let vendor_response = this.parameters.get('vendorresponse');
		let action = this.parameters.get('action');

		const VendorResponseClass = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/'+this.getVendorName()+'/Response.js');

		let response_object = {vendor_response: vendor_response, action: action};

		if(!_.isNull(additional_parameters) && !_.isUndefined(additional_parameters)){
			response_object['additional_parameters'] = additional_parameters;
		}

		return new VendorResponseClass(response_object);

	}

	getVendorName(){

		return objectutilities.getClassName(this).replace('Controller', '');

	}

	setReferenceNumber(){

		du.debug('Set Reference Number');

		let shipping_receipt = this.parameters.get('shippingreceipt', {fatal: false});

		if(!_.isNull(shipping_receipt)){

			this.parameters.set('referencenumber', shipping_receipt.fulfillment_provider_reference);

		}else{

			this.parameters.set('referencenumber', this.createReferenceNumber());

		}

		return true;

	}

	createReferenceNumber(){

		du.debug('Create Reference Number');

		return uuidV4();

	}

	setMethod(){

		du.debug('Set Method');

		let action = this.parameters.get('action');

		if(objectutilities.hasRecursive(this, 'methods.'+action)){

			this.parameters.set('method', this.methods[action]);

		}

		return true;

	}

};
