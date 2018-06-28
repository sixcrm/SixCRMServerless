
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class TrackerResponse extends Response {

	constructor(){

		super();

		this.parameter_validation = {
			'vendorresponse':global.SixCRM.routes.path('model','providers/shipping/terminal/responses/vendorresponseclass.json')
		};

		this.parameter_definition = {
			'constructor':{
				required:{
				},
				optional:{
					shippingreceipt: 'shipping_receipt',
					responsetype:'response_type',
					vendorresponse: 'vendor_response'
				}
			}
		}

		this.initialize();

		if(objectutilities.nonEmpty(arguments)){
			this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});
		}

	}

	setVendorResponse(vendor_response){

		du.debug('Set Vendor Response');

		this.parameters.set('vendorresponse', vendor_response);

	}

	getVendorResponse(){

		du.debug('Get Vendor Response');

		let vendor_response = this.parameters.get('vendorresponse', {fatal: false});

		if(_.isNull(vendor_response) || _.isUndefined(vendor_response)){
			return null;
		}

		return vendor_response;

	}

}
