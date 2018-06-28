const querystring = require('querystring');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');
const PaymentXPAPI = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/api.js');
const PaymentXPResponse = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/Response.js');

class PaymentXPController extends MerchantProvider {
	constructor({merchant_provider}){
		super(arguments[0]);

		this.configure(merchant_provider);

		this.parameter_definition = {
			process:{
				required:{
					customer: 'customer',
					creditcard: 'creditcard',
					amount: 'amount'
				},
				optional:{}
			},
			refund:{
				required:{
					transaction: 'transaction',
					amount: 'amount'
				},
				optional:{}
			},
			reverse:{
				required:{
					transaction: 'transaction'
				},
				optional:{}
			}
		};

		this.parameter_validation = {};

		this.augmentParameters();

		this.paymentxp = new PaymentXPAPI(merchant_provider.gateway);
	}

	async process({customer, creditcard, amount}) {
		du.debug('Process');
		const action = 'process';
		this.parameters.setParameters({
			argumentation: {customer, creditcard, amount},
			action
		});

		const vendor_response = await this.paymentxp.creditcardCharge({creditcard, customer, amount});
		return new PaymentXPResponse({action, vendor_response});
	}

	async refund({transaction, amount}) {
		du.debug('Refund');
		const action = 'refund';
		this.parameters.setParameters({
			argumentation: {transaction, amount},
			action
		});

		const transaction_id = querystring.parse(transaction.processor_response).TransactionID;
		const vendor_response = await this.paymentxp.creditcardCredit({transaction_id, amount});
		return new PaymentXPResponse({action, vendor_response});
	}

	async reverse({transaction}) {
		du.debug('Reverse');
		const action = 'reverse';
		this.parameters.setParameters({
			argumentation: {transaction},
			action
		});

		const transaction_id = querystring.parse(transaction.processor_response).TransactionID;
		const vendor_response = await this.paymentxp.creditcardVoid({transaction_id});
		return new PaymentXPResponse({action, vendor_response});
	}
}

module.exports = PaymentXPController;
