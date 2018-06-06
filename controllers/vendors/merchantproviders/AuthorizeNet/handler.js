const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');
const AuthorizeNetAPI = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js');
const AuthorizeNetResponse = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/Response.js');
const CreditCardHelper = global.SixCRM.routes.include('controllers', 'helpers/entities/creditcard/CreditCard.js');

class AuthorizeNetController extends MerchantProvider {
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
			},
			test:{
				required:{},
				optional:{}
			}
		};

		this.parameter_validation = {};

		this.augmentParameters();

		this.creditcardHelper = new CreditCardHelper();
		this.authorizenet = new AuthorizeNetAPI(merchant_provider.gateway);
	}

	async process({customer, creditcard, amount}) {
		du.debug('Process');
		const action = 'process';
		this.parameters.setParameters({
			argumentation: {creditcard, amount},
			action
		});

		let customer_profile_id, payment_profile_id;
		try {
			const normalized_expiration = `${this.creditcardHelper.getExpirationYear(creditcard)}-${this.creditcardHelper.getExpirationMonth(creditcard)}`;

			const customer_profile = await this.authorizenet.getCustomerProfile(customer);

			customer_profile_id = customer_profile.customerProfileId;

			const payment_profiles = customer_profile.paymentProfiles;
			const payment_profile = arrayutilities.find(payment_profiles, payment_profile => {
				const profile_creditcard = payment_profile.payment.creditCard;
				return creditcard.last_four === profile_creditcard.cardNumber.slice(-4) &&
					creditcard.first_six === profile_creditcard.issuerNumber &&
					normalized_expiration === profile_creditcard.expirationDate;
			});

			payment_profile_id = payment_profile.customerPaymentProfileId;
		} catch(error) {
			if (error.code === 'E00040') {
				const response = await this.authorizenet.createCustomerProfile(customer, [creditcard]);
				customer_profile_id = response.customerProfileId;
				payment_profile_id = response.customerPaymentProfileIdList[0];
			} else {
				return new AuthorizeNetResponse({action, vendor_response: {
					error: error,
					body: error.message,
					response: {
						statusCode: 400,
						body: error.message
					}
				}});
			}
		}

		const vendor_response = await this.authorizenet.chargePaymentProfile({customer_profile_id, payment_profile_id, amount});
		return new AuthorizeNetResponse({action, vendor_response});
	}

	async refund({transaction, amount}) {
		du.debug('Refund');
		const action = 'refund';
		this.parameters.setParameters({
			argumentation: {transaction, amount},
			action
		});

		const transaction_id = transaction.processor_response.transactionResponse.transId;
		const last_four = transaction.processor_response.transactionResponse.accountNumber.slice(-4);
		const vendor_response = await this.authorizenet.refundCreditCard({amount, transaction_id, last_four});
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
