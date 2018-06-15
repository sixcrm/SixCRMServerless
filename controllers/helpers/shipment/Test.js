

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const ShipmentUtilities = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

module.exports = class TestController extends ShipmentUtilities {

	constructor(){

		super();

		this.parameter_validation = {
			'vendorresponseclass':global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/response/responseclass.json')
		};

		this.parameter_definition = {
			execute:{
				required:{
					fulfillmentproviderid:'fulfillment_provider_id'
				},
				optional:{}
			}
		};

		this.response_validation = global.SixCRM.routes.path('model', 'providers/shipping/terminal/responses/test.json');

		this.augmentParameters();

	}

	execute(){

		du.debug('Fulfill');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
			.then(() => this.hydrateFulfillmentProvider())
			.then(() => this.instantiateFulfillmentProviderClass())
			.then(() => this.executeTest())
			.then(() => this.validateResponse())
			.then(() => this.pruneResponse())
			.then(() => {
				return this.parameters.get('vendorresponseclass');
			});

	}

	executeTest(){

		du.debug('Execute Fulfillment');

		let instantiated_fulfillment_provider = this.parameters.get('instantiatedfulfillmentprovider');

		return instantiated_fulfillment_provider.test().then(vendorresponseclass =>{

			this.parameters.set('vendorresponseclass', vendorresponseclass);

			return true;

		});

	}

}
