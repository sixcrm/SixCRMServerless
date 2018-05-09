const {
	APIContracts,
	APIControllers,
	Constants
} = require('authorizenet');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class AuthorizeNet {
	constructor({api_key, transaction_key}) {
		this.endpoint = Constants.endpoint.sandbox;
		this.api_key = api_key;
		this.transaction_key = transaction_key;
	}

	testAuthentication() {
		const merchant_auth = this.buildAuthenticationType();
		const request = new APIContracts.AuthenticateTestRequest();
		request.setMerchantAuthentication(merchant_auth);

		return new Promise((resolve, reject) => {
			const ctrl = new APIControllers.AuthenticateTestController(request.getJSON());
			ctrl.setEnvironment(this.endpoint);
			ctrl.execute(() => {
				const raw_response = ctrl.getResponse();
				const response = new APIContracts.AuthenticateTestResponse(raw_response);

				if (response === undefined || response === null) {
					return reject(new Error('No response.'));
				}

				if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.ERROR) {
					const message = response.getMessages().getMessage()[0];
					return reject(new Error(message.getText()));
				}

				return resolve(raw_response);
			});
		})
			.then(response => ({
				error: null,
				body: response,
				response: {
					statusCode: 200,
					body: response
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

	chargeCreditCard({amount, creditcard}) {
		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
		transaction.setPayment(this.buildCreditCardPaymentType(creditcard));
		transaction.setAmount(amount);

		return this.createTransaction(transaction);
	}

	refundCreditCard({amount, creditcard}) {
		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
		transaction.setPayment(this.buildCreditCardPaymentType(creditcard));
		transaction.setAmount(amount);

		return this.createTransaction(transaction);
	}

	voidTransaction({transaction_id}) {
		const transaction = new APIContracts.TransactionRequestType();
		transaction.setTransactionType(APIContracts.TransactionTypeEnum.VOIDTRANSACTION);
		transaction.setRefTransId(transaction_id);

		return this.createTransaction(transaction);
	}

	createTransaction(transaction) {
		return new Promise(resolve => {
			const merchant_auth = this.buildAuthenticationType();

			const request = new APIContracts.CreateTransactionRequest();
			request.setMerchantAuthentication(merchant_auth);
			request.setTransactionRequest(transaction);

			const ctrl = new APIControllers.CreateTransactionController(request.getJSON());
			ctrl.setEnvironment(this.endpoint);

			ctrl.execute(() => {
				const raw_response = ctrl.getResponse();
				const response = new APIContracts.CreateTransactionResponse(raw_response);
				du.debug(raw_response);

				const result = {
					error: null,
					body: raw_response,
					response: {
						statusCode: 200,
						body: raw_response
					}
				};

				if (response === undefined || response === null) {
					result.response.statusCode = 400;
					result.error = new Error('No response.');
					return resolve(result);
				}

				if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.ERROR) {
					const message = response.getMessages().getMessage()[0];
					result.response.statusCode = 400;
					result.error = new Error(message.getText());
					return resolve(result);
				}


				if (response.getTransactionResponse().getMessages() === undefined) {
					result.response.statusCode = 400;
					result.error = new Error('Transaction Failed for Unknown Reason.');
					return resolve(result);
				}

				if (response.getTransactionResponse().getErrors() !== undefined) {
					const error_obj = response.getTransactionResponse().getErrors().getError()[0];
					result.response.statusCode = 400;
					result.error = new Error(error_obj.getErrorText());
					return resolve(result);
				}

				return resolve(result);
			});
		});
	}

	buildAuthenticationType() {
		const merchant_auth = new APIContracts.MerchantAuthenticationType();
		merchant_auth.setName(this.api_key);
		merchant_auth.setTransactionKey(this.transaction_key);
		return merchant_auth;
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
}
