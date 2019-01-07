const {
	APIContracts,
	APIControllers,
	Constants
} = require('authorizenet');
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class AuthorizeNet {
	constructor({api_key, transaction_key}) {
		this.endpoint = Constants.endpoint.production;
		this.api_key = api_key;
		this.transaction_key = transaction_key;
	}

	testAuthentication() {
		const request = new APIContracts.AuthenticateTestRequest();
		return this.makeRequest(APIControllers.AuthenticateTestController, request)
			.then(api_response => ({
				error: null,
				body: api_response,
				response: {
					statusCode: 200,
					body: api_response
				}
			}))
			.catch(error => ({
				error: error,
				body: error.message,
				response: {
					statusCode: 400,
					body: error.message
				}
			}));
	}

	getCustomerProfile({email}) {
		const request = new APIContracts.GetCustomerProfileRequest();
		request.setEmail(email);
		request.setUnmaskExpirationDate(true);
		request.setIncludeIssuerInfo(true);

		return this.makeRequest(APIControllers.GetCustomerProfileController, request)
			.then(api_response => {
				const response = new APIContracts.GetCustomerProfileResponse(api_response);
				return response.getProfile();
			});
	}

	createCustomerProfile(customer, creditcards) {
		const customer_profile = new APIContracts.CustomerProfileType();
		customer_profile.setEmail(customer.email);

		const request = new APIContracts.CreateCustomerProfileRequest();
		request.setProfile(customer_profile);

		if (creditcards) {
			const payment_profiles = arrayutilities.map(creditcards, creditcard => this.buildPaymentProfileType(customer, creditcard));
			customer_profile.setPaymentProfiles(payment_profiles);
			request.setValidationMode(APIContracts.ValidationModeEnum.TESTMODE);
		}

		return this.makeRequest(APIControllers.CreateCustomerProfileController, request);
	}

	createPaymentProfile(customer_profile_id, customer, creditcard) {
		const payment_profile = this.buildPaymentProfileType(customer, creditcard);

		const request = new APIContracts.CreateCustomerPaymentProfileRequest();
		request.setCustomerProfileId(customer_profile_id);
		request.setPaymentProfile(payment_profile);
		request.setValidationMode(APIContracts.ValidationModeEnum.TESTMODE);

		return this.makeRequest(APIControllers.CreateCustomerPaymentProfileController, request);
	}

	chargeCreditCard({amount, creditcard}) {
		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
		transaction.setPayment(this.buildCreditCardPaymentType(creditcard));
		transaction.setAmount(amount);

		return this.createTransaction(transaction);
	}

	chargePaymentProfile({customer_profile_id, payment_profile_id, amount}) {
		const payment_profile = new APIContracts.PaymentProfile();
		payment_profile.setPaymentProfileId(payment_profile_id);

		const profile_to_charge = new APIContracts.CustomerProfilePaymentType();
		profile_to_charge.setCustomerProfileId(customer_profile_id);
		profile_to_charge.setPaymentProfile(payment_profile);

		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
		transaction.setProfile(profile_to_charge);
		transaction.setAmount(amount);

		return this.createTransaction(transaction);
	}

	refundCreditCard({amount, transaction_id, last_four}) {
		const creditcard = {
			number: last_four,
			expiration: 'XXXX'
		};
		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
		transaction.setPayment(this.buildCreditCardPaymentType(creditcard));
		transaction.setAmount(amount);
		transaction.setRefTransId(transaction_id);

		return this.createTransaction(transaction);
	}

	voidTransaction({transaction_id}) {
		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.VOIDTRANSACTION);
		transaction.setRefTransId(transaction_id);

		return this.createTransaction(transaction);
	}

	createTransaction(transaction) {
		const request = new APIContracts.CreateTransactionRequest();
		request.setTransactionRequest(transaction);

		return this.makeRequest(APIControllers.CreateTransactionController, request)
			.then(api_response => {
				const response = new APIContracts.CreateTransactionResponse(api_response);

				const result = {
					error: null,
					body: api_response,
					response: {
						statusCode: 200,
						body: api_response
					}
				};

				if (response.getTransactionResponse().getMessages() === undefined) {
					result.response.statusCode = 400;
					result.error = new Error('Transaction Failed for Unknown Reason.');
				}

				if (response.getTransactionResponse().getErrors() !== undefined) {
					const error_obj = response.getTransactionResponse().getErrors().getError()[0];
					result.response.statusCode = 400;
					const error = new Error(error_obj.getErrorText());
					error.code = error_obj.getErrorCode();
					result.error = error;
				}

				return result;
			})
			.catch(error => ({
				error,
				body: error.message,
				response: {
					statusCode: 400,
					body: error.message
				}
			}));
	}

	buildCreditCardPaymentType({number, expiration, cvv}) {
		const creditcard = new APIContracts.CreditCardType();
		creditcard.setCardNumber(number);
		creditcard.setExpirationDate(expiration);
		creditcard.setCardCode(cvv);

		const payment_type = new APIContracts.PaymentType();
		payment_type.setCreditCard(creditcard);
		return payment_type;
	}

	buildPaymentProfileType(customer, creditcard) {
		const payment_type = this.buildCreditCardPaymentType(creditcard);

		const address_type = new APIContracts.CustomerAddressType();
		address_type.setFirstName(customer.firstname);
		address_type.setLastName(customer.lastname);
		address_type.setPhoneNumber(customer.phone);

		if (creditcard.address) {
			address_type.setAddress(creditcard.address.line1);
			address_type.setCity(creditcard.address.city);
			address_type.setState(creditcard.address.state);
			address_type.setZip(creditcard.address.zip);
			address_type.setCountry(creditcard.address.country);
		}

		const payment_profile = new APIContracts.CustomerPaymentProfileType();
		payment_profile.setCustomerType(APIContracts.CustomerTypeEnum.INDIVIDUAL);
		payment_profile.setPayment(payment_type);
		payment_profile.setBillTo(address_type);
		return payment_profile;
	}

	makeRequest(controller, request) {
		return new Promise((resolve, reject) => {
			const merchant_auth = new APIContracts.MerchantAuthenticationType();
			merchant_auth.setName(this.api_key);
			merchant_auth.setTransactionKey(this.transaction_key);

			request.setMerchantAuthentication(merchant_auth);

			const ctrl = new controller(request.getJSON());
			ctrl.setEnvironment(this.endpoint);

			ctrl.execute(() => {
				const api_response = ctrl.getResponse();
				du.info(api_response);
				const response = new APIContracts.ANetApiResponse(api_response);

				if (response === undefined || response === null) {
					return reject(new Error('No response.'));
				}

				if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.ERROR) {
					const message = response.getMessages().getMessage()[0];
					const error = new Error(message.getText());
					error.code = message.getCode();
					return reject(error);
				}

				return resolve(api_response);
			});
		});
	}
}
