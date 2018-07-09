const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/providers/http-provider').default;
const httpprovider = new HttpProvider();

const ShippingCarrierController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/components/ShippingCarrier.js');

module.exports = class TestController extends ShippingCarrierController {

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
			'trackingnumber': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/Test/trackingnumber.json'),
			'action':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/action.json'),
			'requestjson':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/Test/inforequest.json'),
			'requesturi':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/Test/inforequesturi.json'),
			'vendorresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/Test/response.json')
		};

		this.augmentParameters();

	}

	info(){

		du.debug('info');

		this.parameters.set('action', 'info');

		return Promise.resolve()
			.then(() => this.setParameters({argumentation: arguments[0], action: 'info'}))
			.then(() => this.acquireAPIResult())
			.then(() => this.respond({}));

	}

	acquireAPIResult(){

		du.debug('Acquire API Result');

		return Promise.resolve()
			.then(() => this.buildRequestJSON())
			.then(() => this.buildRequestURI())
			.then(() => this.executeAPIRequest())

	}

	buildRequestURI(){

		du.debug('Build Request URI');

		let vendor_configuration = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage+'/vendors/shippingcarriers/Test.yml');

		this.parameters.set('requesturi', vendor_configuration.endpoint+'getinfo');

		return true;

	}

	buildRequestJSON(){

		du.debug('Build Request JSON');

		let tracking_number = this.parameters.get('trackingnumber');

		this.parameters.set('requestjson', {tracking_number: tracking_number});

		return true;

	}

	executeAPIRequest(){

		du.debug('Execute API Request');

		let request_uri = this.parameters.get('requesturi');
		let request_json = this.parameters.get('requestjson');

		let parameters = {
			body: request_json,
			url: request_uri
		}

		return httpprovider.postJSON(parameters).then(response => {

			if(response.error){
				throw response.error;
			}

			this.parameters.set('vendorresponse', response.response);

			return true;

		});

	}

}
