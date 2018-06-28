const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const querystring = require('querystring');
const currencyutilities = require('@6crm/sixcrmcore/util/currency-utilities').default;
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();
const auth_helper = global.SixCRM.routes.include('test', 'live-transactions/helpers/authentication.js');
const tu = require('@6crm/sixcrmcore/util/test-utilities').default;

const config = global.SixCRM.routes.include('test', 'live-transactions/config/'+process.env.stage+'.yml');

const scenarios = [
	{
		processor: 'NMI',
		campaign: '1b3c5526-c9ff-4122-8c29-6fa4c310831a',
		product: 'cc2984b1-5fa3-4e7d-8bda-a5b67fcbd15f',
		product_schedule: '02891338-dc57-4ae1-9748-ed1a641ddb7d'
	}, {
		processor: 'Stripe',
		campaign: 'f5a79bbb-b04b-44ac-bf15-1183e5cb67b9',
		product: 'dc57f5e3-ce95-4318-9127-9f14f123a690',
		product_schedule: '27ac0145-b46c-4eb2-bc2e-3456ff1fb3d6'
	}
];

const customer = { email: 'live@test.test' };

const creditcards = [{
	name: 'Timothy Dalbey',
	number: '379717520961006',
	cvv: '4567',
	expiration: '05/20',
	address: {
		line1: "6738 N. Willamette BLVD",
		city: "Portland",
		state: "OR",
		zip: "97203",
		country: "US"
	}
}];

scenarios.forEach(({processor, campaign, product, product_schedule}) => {
	describe(`Live Checkout (${processor})`, () => {
		let auth_token, transaction_result;

		beforeEach(() => {
			return auth_helper.authenticate(campaign)
				.then(token => {
					auth_token = token;
				});
		});

		afterEach(() => {
			const transaction_to_refund = transaction_result;
			auth_token, transaction_result = undefined;

			if (transaction_to_refund) {
				return refund(transaction_to_refund)
					.then(response => {
						expect(response.response.statusCode).to.equal(200, `Refund request failed with error: "${response.body.message}"`);
						expect(response.body.success).to.be.true;
						expect(response.body.response.data.refund.processor_response.code).to.equal('success');
					});
			}
		});

		creditcards.forEach(creditcard => {
			it('is successful with product', () => {
				return checkout(auth_token, {
					campaign,
					creditcard,
					customer,
					products: [{
						quantity: 1,
						product
					}]
				})
					.then(response => {
						expect(response.response.statusCode).to.equal(200, `Checkout request failed with error: "${response.body.message}"`);
						expect(response.body.success).to.be.true;
						expect(response.body.response.transactions).to.have.lengthOf(1);
						const processor_response = JSON.parse(response.body.response.transactions[0].processor_response);
						const processor_responsetext = querystring.parse(processor_response.result.response.body).responsetext;
						expect(processor_response.code).to.equal('success', `${processor} request failed with error "${processor_responsetext}"`);
						transaction_result = response.body.response.transactions[0];
					});
			});

			it('is successful with product schedule', () => {
				return checkout(auth_token, {
					campaign,
					creditcard,
					customer,
					product_schedules: [{
						quantity: 1,
						product_schedule
					}]
				})
					.then(response => {
						expect(response.response.statusCode).to.equal(200, `Checkout request failed with error: "${response.body.message}"`);
						expect(response.body.success).to.be.true;
						expect(response.body.response.transactions).to.have.lengthOf(1);
						const processor_response = JSON.parse(response.body.response.transactions[0].processor_response);
						const processor_responsetext = querystring.parse(processor_response.result.response.body).responsetext;
						expect(processor_response.code).to.equal('success', `${processor} request failed with error "${processor_responsetext}"`);
						transaction_result = response.body.response.transactions[0];
					});
			});

			it('is successful without cvv', () => {
				return checkout(auth_token, {
					campaign,
					creditcard: _.omit(creditcard, ['cvv']),
					customer,
					products: [{
						quantity: 1,
						product
					}]
				})
					.then(response => {
						expect(response.response.statusCode).to.equal(200, `Checkout request failed with error: "${response.body.message}"`);
						expect(response.body.success).to.be.true;
						expect(response.body.response.transactions).to.have.lengthOf(1);
						const processor_response = JSON.parse(response.body.response.transactions[0].processor_response);
						const processor_responsetext = querystring.parse(processor_response.result.response.body).responsetext;
						expect(processor_response.code).to.equal('success', `${processor} request failed with error "${processor_responsetext}"`);
						transaction_result = response.body.response.transactions[0];
					});
			});
		});
	});
});

function checkout(token, body) {
	return httpprovider.postJSON({
		url: `${config.endpoint}checkout/${config.account}`,
		headers: {
			Authorization: token
		},
		body
	});
}

function refund(transaction) {
	const test_jwt = tu.createTestAuth0JWT(config.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	return httpprovider.post({
		url: `${config.endpoint}graph/${config.account}`,
		headers: {
			Authorization: test_jwt
		},
		body: `
			mutation {
				refund (refund: { transaction: "${transaction.id}", amount: "${currencyutilities.toCurrencyString(transaction.amount)}" }) {
					transaction {
						id
					},
					processor_response
				}
			}
		`
	})
		.then(response => {
			response.body = JSON.parse(response.body);
			return response;
		});
}
