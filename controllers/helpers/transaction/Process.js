

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');
const MerchantProviderController = global.SixCRM.routes.include('entities', 'MerchantProvider.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class Process extends TransactionUtilities{

	constructor(){

		super();

		this.parameter_definition = {
			process: {
				required:{
					customer:'customer',
					creditcard: 'creditcard',
					amount:'amount',
					merchantproviderid:'merchant_provider'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'process': global.SixCRM.routes.path('model','transaction/process.json'),
			'creditcard': global.SixCRM.routes.path('model','transaction/creditcard.json'),
			'customer': global.SixCRM.routes.path('model','transaction/customer.json'),
			'merchantproviderid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'merchantprovider': global.SixCRM.routes.path('model','entities/merchantprovider.json'),
			'amount':global.SixCRM.routes.path('model','transaction/amount.json')
		};

		this.merchantProviderController = new MerchantProviderController();
		this.merchantProviderController.sanitize(false);

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	process(){

		du.debug('Process');

		return Promise.resolve(this.parameters.setParameters({argumentation: arguments[0], action:'process'}))
			.then(() => this.hydrateMerchantProvider())
			.then(() => this.processTransaction());

	}

	hydrateMerchantProvider(){

		du.debug('Hydrate Merchant Provider');

		let merchant_provider_id = this.parameters.get('merchantproviderid');

		return this.merchantProviderController.get({id:merchant_provider_id}).then(merchant_provider => {
			this.parameters.set('merchantprovider', merchant_provider);
			return true;
		});

	}

	//Technical Debt:  Untested
	processTransaction(){

		du.debug('Process Transaction');

		return this.instantiateGateway()
			.then(() => this.createProcessingParameters())
			.then(() => {

				let processing_parameters = this.parameters.get('process');
				let instantiated_gateway = this.parameters.get('instantiated_gateway');

				return instantiated_gateway.process(processing_parameters);

			}).then((response) => {

				let merchantprovider = this.parameters.get('merchantprovider');
				let creditcard = this.parameters.get('creditcard');

				response.merchant_provider = merchantprovider.id;
				response.creditcard = creditcard.id;

				return response;

			});

	}

	instantiateGateway(){

		du.debug('Instantiate Gateway');

		let merchant_provider = this.parameters.get('merchantprovider');

		const GatewayController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/'+merchant_provider.gateway.name+'/handler.js');
		let gateway = new GatewayController({merchant_provider: merchant_provider});

		this.parameters.set('instantiated_gateway', gateway);

		return Promise.resolve(gateway);

	}

	createProcessingParameters(){

		du.debug('Create Processing Parameters');

		let customer = this.parameters.get('customer');
		let creditcard = this.parameters.get('creditcard');
		let amount = this.parameters.get('amount');

		let parameters = {
			customer: customer,
			creditcard: creditcard,
			amount: amount
		};

		this.parameters.set('process', parameters);

		return Promise.resolve(parameters);

	}

}
