const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');
const AuthorizeNetProvider = global.SixCRM.routes.include('controllers', 'providers/authorizenet-provider.js');
const AuthorizeNetResponse = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/Response.js');

class AuthorizeNetController extends MerchantProvider {
	constructor({merchant_provider}){
		super(arguments[0]);

		this.configure(merchant_provider);

		this.parameter_definition = {
			process:{
				required:{
					creditcard: 'creditcard',
					amount: 'amount'
				},
				optional:{}
			},
			refund:{
				required:{
					transaction: 'transaction',
					creditcard: 'creditcard',
					amount: 'amount'
				},
				optional:{}
			},
			reverse:{
				required:{
					transaction: 'transaction'
				},
				optional:{}
			},
			test:{
				required:{},
				optional:{}
			}
		};

		this.parameter_validation = {};

		this.augmentParameters();

		this.authorizenet = new AuthorizeNetProvider(merchant_provider.gateway);
	}

	async process({creditcard, amount}) {
		du.debug('Process');
		const action = 'process';
		this.parameters.setParameters({
			argumentation: {creditcard, amount},
			action
		});

		const vendor_response = await this.authorizenet.chargeCreditCard({creditcard, amount});
		return new AuthorizeNetResponse({action, vendor_response});
	}

	async refund({transaction}) {
		du.debug('Refund');
		const action = 'refund';
		this.parameters.setParameters({
			argumentation: {transaction},
			action
		});

		const transaction_id = transaction.processor_response.transactionResponse.transId;
		const vendor_response = await this.authorizenet.refundCreditCard({transaction_id});
		return new AuthorizeNetResponse({action, vendor_response});
	}

	async reverse({transaction}) {
		du.debug('Reverse');
		const action = 'reverse';
		this.parameters.setParameters({
			argumentation: {transaction},
			action
		});

		const transaction_id = transaction.processor_response.transactionResponse.transId;
		const vendor_response = await this.authorizenet.voidTransaction({transaction_id});
		return new AuthorizeNetResponse({action, vendor_response});
	}

	async test() {
		du.debug('Test');
		const action = 'test';
		this.parameters.setParameters({
			argumentation: {},
			action
		});

		const vendor_response = await this.authorizenet.testAuthentication();
		return new AuthorizeNetResponse({action, vendor_response});
	}
}

module.exports = AuthorizeNetController;
