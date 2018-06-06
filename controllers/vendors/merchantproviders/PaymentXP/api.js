const querystring = require('querystring');
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();

module.exports = class PaymentXPAPI {
	constructor({username, password}) {
		this.username = username;
		this.password = password;
		this.endpoint = 'https://webservice.paymentxp.com/wh/WebHost.aspx';
	}

	creditcardCharge({creditcard, customer, amount}) {
		const formatted_expiration = creditcard.expiration.slice(0, 2) + creditcard.expiration.slice(-2);

		return this.makeRequest({
			TransactionType: 'CreditCardCharge',
			TransactionAmount: amount,
			CardNumber: creditcard.number,
			CVV2: creditcard.cvv,
			ExpirationDateMMYY: formatted_expiration,
			BillingNameFirst: customer.firstname,
			BillingNameLast: customer.lastname,
			PhoneNumber: customer.phone,
			EmailAddress: customer.email,
			BillingAddress: customer.address.line1,
			BillingCity: customer.address.city,
			BillingState: customer.address.state,
			BillingZipCode: customer.address.zip,
			BillingCountry: customer.address.country
		});
	}

	creditcardVoid({transaction_id}) {
		return this.makeRequest({
			TransactionType: 'CreditCardVoid',
			TransactionID: transaction_id
		});
	}

	creditcardCredit({transaction_id, amount}) {
		return this.makeRequest({
			TransactionType: 'CreditCardAdjust',
			TransactionID: transaction_id,
			TransactionAmount: amount
		});
	}

	makeRequest(parameters) {
		parameters.MerchantID = '10012';
		parameters.MerchantKey = 'c22a63ee-2e7a-4ace-96ac-0958dc8d953f';

		const request_options = {
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			url: this.endpoint,
			body: querystring.stringify(parameters)
		};

		return httpprovider.post(request_options)
			.then(response => ({
				error: null,
				body: response.body,
				response: {
					statusCode: 200,
					body: response.body
				}
			}));
	}
}
