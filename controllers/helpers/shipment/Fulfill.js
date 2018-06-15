

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const ShipmentUtilities = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

module.exports = class FulfillController extends ShipmentUtilities {

	constructor(){

		super();

		this.parameter_validation = {
			'vendorresponseclass':global.SixCRM.routes.path('model', 'providers/shipping/terminal/responses/vendorresponseclass.json')
		};

		this.parameter_definition = {
			execute:{
				required:{
					fulfillmentproviderid:'fulfillment_provider_id',
					augmentedtransactionproducts: 'augmented_transaction_products'
				},
				optional:{}
			}
		};

		this.response_validation = global.SixCRM.routes.path('model', 'providers/shipping/terminal/responses/fulfill.json');

		this.augmentParameters();

	}

	execute(){

		du.debug('Fulfill');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
			.then(() => this.hydrateRequestProperties())
			.then(() => this.instantiateFulfillmentProviderClass())
			.then(() => this.executeFulfillment())
			.then(() => this.validateResponse())
			.then(() => this.pruneResponse())
			.then(() => {
				return this.parameters.get('vendorresponseclass');
			});

	}

	pruneResponse(){

		du.debug('Prune Response');

		let vendor_response_class = this.parameters.get('vendorresponseclass');

		vendor_response_class.parameters.unset('vendorresponse');
		vendor_response_class.parameters.unset('response');

		this.parameters.set('vendorresponseclass', vendor_response_class);

		return true;

	}

	hydrateRequestProperties(){

		du.debug('Hydrate Request Properties');

		let promises = [
			this.hydrateFulfillmentProvider(),
			this.hydrateAugmentedTransactionProducts(),
			this.acquireCustomer()
		];

		return Promise.all(promises).then(() => {

			return true;

		});

	}

	hydrateAugmentedTransactionProducts(){

		du.debug('Hydrate Augmented Transaction Products');

		return this.hydrateProducts()
			.then(() => this.marryProductsToAugmentedTransactionProducts());

	}

	executeFulfillment(){

		du.debug('Execute Fulfillment');

		let instantiated_fulfillment_provider = this.parameters.get('instantiatedfulfillmentprovider');
		let hydrated_augmented_transaction_products = this.parameters.get('hydratedaugmentedtransactionproducts');
		let customer = this.parameters.get('customer');

		//Technical Debt:  So why all the work to create these things?
		let products = arrayutilities.map(hydrated_augmented_transaction_products, hydrated_augmented_transaction_product => {
			return hydrated_augmented_transaction_product.product;
		});

		return instantiated_fulfillment_provider.fulfill({customer: customer, products: products}).then(vendor_response_class =>{

			this.parameters.set('vendorresponseclass', vendor_response_class);

			return true;

		});

	}

}
