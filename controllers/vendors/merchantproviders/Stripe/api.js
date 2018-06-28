const stripe = require('stripe');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class Stripe {

	constructor(api_key) {

		this.instantiateStripe(api_key);

	}

	instantiateStripe(api_key) {

		du.debug('Instantiate Stripe');

		this.stripe = stripe(api_key);

	}

	getCustomer(stripe_token) {

		du.debug('Get Customer');

		return new Promise((resolve, reject) => {

			this.stripe.customers.retrieve(
				stripe_token,
				(error, customer) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(customer);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

	createCustomer(parameters) {

		du.debug('Create Customer');

		return new Promise((resolve, reject) => {

			this.stripe.customers.create(
				parameters,
				(error, customer) => {
					if (error) {
						return reject(error);
					}
					return resolve(customer);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

	updateCustomer({
		customer_token,
		parameters
	}) {

		du.debug('Update Customer');

		return new Promise((resolve, reject) => {

			this.stripe.customers.update(
				customer_token,
				parameters,
				(error, customer) => {
					if (error) {
						return reject(error);
					}
					return resolve(customer);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

	getCreditCard(stripe_token) {

		du.debug('Get Credit Card');

		return new Promise((resolve, reject) => {

			this.stripe.tokens.retrieve(
				stripe_token,
				(error, token) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(token);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {
			return response;
		});

	}

	createCreditCard(parameters) {

		du.debug('Create Credit Card');

		return new Promise((resolve, reject) => {

			this.stripe.tokens.create(
				parameters,
				(error, token) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(token);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

	getSource(stripe_token) {

		du.debug('Get Source');

		return new Promise((resolve, reject) => {

			this.stripe.sources.retrieve(
				stripe_token,
				(error, token) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(token);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {
			return response;
		});

	}

	createSource(parameters) {

		du.debug('Create Source');

		return new Promise((resolve, reject) => {

			this.stripe.sources.create(
				parameters,
				(error, token) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(token);
				}
			);

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

	createRefund(parameters) {

		du.debug('Create Refund');

		return new Promise((resolve, reject) => {

			this.stripe.refunds.create(
				parameters,
				(error, refund) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(refund);
				}
			);

		}).then(response => {

			return {
				error: null,
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: response
				},
				body: response
			};

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

	createCharge(parameters) {

		du.debug('Create Charge');

		return new Promise((resolve, reject) => {

			this.stripe.charges.create(
				parameters,
				(error, charges) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(charges);
				}
			);

		}).then(response => {

			return {
				error: null,
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: response
				},
				body: response
			};

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		});

	}

	listCharges(parameters) {

		du.debug('List Charges');

		return new Promise((resolve, reject) => {

			this.stripe.charges.list(
				parameters,
				(error, charges) => {
					if (error) {
						du.error(error);
						return reject(error);
					}
					return resolve(charges);
				}
			);

		}).then(response => {

			return {
				error: null,
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: response
				},
				body: response
			};

		}).catch(error => {

			return {
				error: error,
				response: {
					statusCode: error.statusCode,
					body: error.message
				},
				body: error.message
			};

		}).then(response => {

			return response;

		});

	}

}
