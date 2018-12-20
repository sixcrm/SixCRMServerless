var request = require('request');
const ShippingCarrierController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/components/ShippingCarrier.js');

module.exports = class USPSController extends ShippingCarrierController {

	constructor(){

		super();

		this.parameter_definition = {
			info: {
				required: {
					trackingnumber: 'tracking_number'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'trackingnumber': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/trackingnumber.json'),
			'userid': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/userid.json'),
			'requestxml': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requestxml.json'),
			'requesturi': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requesturi.json'),
			'vendorresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/response.json')
		};

		this.augmentParameters();

		this.acquireConfigurationInformation();

	}

	acquireConfigurationInformation(){
		let vendor_configuration = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage+'/vendors/shippingcarriers/USPS.yml');

		this.parameters.set('userid', vendor_configuration.user_id);
		//this.parameters.set('password', vendor_configuration.password);

		return true;

	}

	info(){
		this.parameters.set('action', 'info');

		return Promise.resolve()
			.then(() => this.setParameters({argumentation: arguments[0], action: 'info'}))
			.then(() => this.acquireAPIResult())
			.then(() => this.respond({}));

	}

	acquireAPIResult(){
		return Promise.resolve()
			.then(() => this.buildRequestXML())
			.then(() => this.buildRequestURI())
			.then(() => this.executeAPIRequest());

	}

	buildRequestXML(){
		let tracking_number = this.parameters.get('trackingnumber');
		let user_id = this.parameters.get('userid');

		let request_xml = '<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>';

		this.parameters.set('requestxml', request_xml);

		return true;

	}

	buildRequestURI(){
		let request_xml = this.parameters.get('requestxml');

		let request_uri = 'http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML='+encodeURIComponent(request_xml);

		this.parameters.set('requesturi', request_uri);

		return true;

	}

	executeAPIRequest(){
		let request_uri = this.parameters.get('requesturi');

		return new Promise((resolve) => {

			request(request_uri, (error, response) => {

				if(error){
					throw error;
				}

				this.parameters.set('vendorresponse', response);

				return resolve(true);

			});

		});

	}

}
