

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const ShippingCarrierVendorResponse = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

module.exports = class TestResponse extends ShippingCarrierVendorResponse {

	constructor(){

		super(arguments[0]);

		this.parameter_definition = {};

		this.parameter_validation = {
			'trackingnumber':global.SixCRM.routes.path('model','vendors/shippingcarriers/Test/trackingnumber.json')
		}

		this.augmentParameters();

		this.transformResponse();

	}

	transformResponse(){

		du.debug('Transform Response');

		let action = this.parameters.get('action');

		let transformers = {
			'info':() => this.transformInfoResponse()
		}

		return transformers[action]();

	}

	transformInfoResponse(){

		du.debug('Transform Info Response');

		let vendor_response = this.parameters.get('vendorresponse');

		if(vendor_response.statusCode == 200){

			this.setTrackingNumber();
			this.setStatus();
			this.setDetail();

			this.infoResponse();

		}
	}

	setTrackingNumber(){

		du.debug('Set Tracking Number');

		let vendor_response = this.parameters.get('vendorresponse');

		this.parameters.set('trackingnumber', vendor_response.body.response.tracking_number);

	}

	setStatus(){

		du.debug('Set Status');

		let vendor_response = this.parameters.get('vendorresponse');

		this.parameters.set('status', vendor_response.body.response.status);

	}

	setDetail(){

		du.debug('Set Detail');

		let vendor_response = this.parameters.get('vendorresponse');

		this.parameters.set('detail', vendor_response.body.response.detail.detail);

	}

	setMessage(message){

		du.debug('Set Message');

		this.parameters.set('message', message);

		return true;

	}

	getMessage(){

		du.debug('Get Message');

		return this.parameters.get('message')

	}

}
