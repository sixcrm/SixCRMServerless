
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const uuidV4 = require('uuid/v4');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const signatureutilities = global.SixCRM.routes.include('lib','signature.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const tu = global.SixCRM.routes.include('lib','test-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function createSignature(){

	let request_time = timestamp.createTimestampMilliseconds();
	let secret_key = config.access_keys.super_user.secret_key;
	let access_key = config.access_keys.super_user.access_key;
	let signature = signatureutilities.createSignature(secret_key, request_time);

	return access_key+':'+request_time+':'+signature;

}

function getValidAcquireTokenPostBody(campaign){

	let affiliates =  null;

	arrayutilities.map(['affiliate', 'subaffiliate1', 'subaffiliate2', 'subaffiliate3', 'subaffiliate4', 'subaffiliate5', 'cid'], (field) => {
		if(random.randomBoolean()){
			if(_.isNull(affiliates)){
				affiliates = {};
			}
			affiliates[field] = random.createRandomString(20);
		}
	});

	let return_object = {
		campaign:(_.has(campaign, 'id'))?campaign.id:campaign
	};

	if(!_.isNull(affiliates)){
		return_object.affiliates = affiliates;
	}

	return return_object;

}

function checkout(token, post_body){

	du.info('Checkout');
	let account = config.account;

	let argument_object = {
		url: config.endpoint+'checkout/'+account,
		body: post_body,
		headers:{
			Authorization: token
		}
	};

	return httpprovider.postJSON(argument_object)
		.then((result) => {
			du.debug(result.body);
			expect(result.response.statusCode).to.equal(200);
			expect(result.response.statusMessage).to.equal('OK');
			expect(result.body).to.have.property('success');
			expect(result.body).to.have.property('code');
			expect(result.body).to.have.property('response');
			expect(result.body.success).to.equal(true);
			expect(result.body.code).to.equal(200);
			return result.body;
		});

}

function refund(transaction, amount) {

	du.info('Refund');

	let account = config.account;
	let test_jwt = tu.createTestAuth0JWT(config.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	let argument_object = {
		url: config.endpoint+'graph/'+account,
		body: 'mutation { refund (refund: { amount:"' + amount + '", transaction:"' + transaction + '" } ) { transaction { id }, processor_response } }',
		headers:{
			Authorization: test_jwt
		}
	};

	du.debug(argument_object);

	return httpprovider.post(argument_object)

}

function acquireToken(campaign){

	du.info('Acquire Token');

	let account = config.account;
	let authorization_string = createSignature();
	var post_body = getValidAcquireTokenPostBody(campaign);

	du.warning(config);

	let argument_object = {
		url: config.endpoint+'token/acquire/'+account,
		body: post_body,
		headers:{
			Authorization: authorization_string
		}
	};

	du.info(argument_object);

	return httpprovider.postJSON(argument_object)
		.then((result) => {
			du.debug(result.body);
			expect(result.response.statusCode).to.equal(200);
			expect(result.response.statusMessage).to.equal('OK');
			expect(result.body).to.have.property('success');
			expect(result.body).to.have.property('code');
			expect(result.body).to.have.property('response');
			expect(result.body.success).to.equal(true);
			expect(result.body.code).to.equal(200);
			expect(_.isString(result.body.response)).to.equal(true);
			let authorization_token = result.body.response;

			return authorization_token;
		});

}

function createCheckoutCustomer(){

	let customer = MockEntities.getValidCustomer();

	delete customer.id;
	delete customer.account;
	delete customer.created_at;
	delete customer.updated_at;
	delete customer.creditcards;
	customer.billing = customer.address;

	return customer;

}

function createCheckoutCreditCard(){

	let creditcard = MockEntities.getValidTransactionCreditCard();

	creditcard.number = "4111111111111111";

	return creditcard;

}

function createCheckoutBody(campaign, sale_object){

	let customer = createCheckoutCustomer();
	let creditcard = createCheckoutCreditCard();

	return objectutilities.merge(sale_object, {
		campaign:(_.has(campaign, 'id'))?campaign.id:campaign,
		customer:customer,
		creditcard:creditcard
	});

}

let config = global.SixCRM.routes.include('test', 'integration/config/'+process.env.stage+'.yml');

du.info(config);

let campaign = '70a6689a-5814-438b-b9fd-dd484d0812f9';

describe('Checkout', () => {
	describe('Product Schedules', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: "12529a17-ac32-4e46-b05b-83862843055d",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				})

		});
	});

	describe('Straight Sale', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});

		it('refunds a transaction', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);

					let transaction_id = result.response.transactions[0].id;
					let amount = result.response.transactions[0].amount;

					return refund(transaction_id, amount);
				}).then((result) => {
					du.debug(result.body);

					if (stringutilities.isString(result.body)) {
						result.body = JSON.parse(result.body);
					}

					let processor_response = result.body.response.data.refund.processor_response;

					expect(result.response.statusCode).to.equal(200);
					expect(result.response.statusMessage).to.equal('OK');
					expect(result.body).to.have.property('success');
					expect(result.body).to.have.property('code');
					expect(result.body).to.have.property('response');
					expect(result.body.success).to.equal(true);
					expect(result.body.code).to.equal(200);
					expect(processor_response.message).to.equal('Success');
					expect(processor_response.code).to.equal('success');
				});

		});

		it('transaction refund fails for insufficient funds', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);

					let transaction_id = result.response.transactions[0].id;
					let amount = "100.00";

					return refund(transaction_id, amount);
				}).then((result) => {

					if (stringutilities.isString(result.body)) {
						result.body = JSON.parse(result.body);
					}

					expect(result.body).to.have.property('success');
					expect(result.body).to.have.property('code');
					expect(result.body.success).to.equal(false);
					expect(result.body.code).to.equal(403);
					expect(result.body.message).to.equal("[403] The proposed resolved transaction amount is negative.");
				});

		});

		it('fails for non-existent transaction', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);

					let transaction_id = uuidV4();
					let amount = random.randomDouble(1, 100, 2);

					return refund(transaction_id, amount);
				}).then((result) => {

					if (stringutilities.isString(result.body)) {
						result.body = JSON.parse(result.body);
					}

					expect(result.body).to.have.property('success');
					expect(result.body).to.have.property('code');
					expect(result.body.success).to.equal(false);
					expect(result.body.code).to.equal(500);
					expect(result.body.message).to.have.string("[500] One or more validation errors occurred");
				});

		});

		it('fails for unexpected transaction amount', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);

					let transaction_id = result.response.transactions[0].id;
					let amount = 'an_unexpected_amount';

					return refund(transaction_id, amount);
				}).then((result) => {

					if (stringutilities.isString(result.body)) {
						result.body = JSON.parse(result.body);
					}

					expect(result.body).to.have.property('success');
					expect(result.body).to.have.property('code');
					expect(result.body.success).to.equal(false);
					expect(result.body.code).to.equal(500);
					expect(result.body.message).to.have.string("[500] One or more validation errors occurred");
				});

		});

		it('fails for unexpected transaction id', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);

					let transaction_id = 'an_unexpected_transaction_id';
					let amount = result.response.transactions[0].amount;

					return refund(transaction_id, amount);
				}).then((result) => {

					if (stringutilities.isString(result.body)) {
						result.body = JSON.parse(result.body);
					}

					expect(result.body).to.have.property('success');
					expect(result.body).to.have.property('code');
					expect(result.body.success).to.equal(false);
					expect(result.body.code).to.equal(500);
					expect(result.body.message).to.contain("[500] One or more validation errors occurred:");
				});

		});
	});

	describe('Straight Sale With Dynamic Price', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2,
					price: 12.99
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});
	});

	describe('Mixed Sale', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: "12529a17-ac32-4e46-b05b-83862843055d",
					quantity:2
				}],
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2,
					price: 12.99
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});

	});

	describe('Dynamic Product Schedule', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: {
						schedule:[
							{
								product: {
									id: "aba9a683-85a4-45e7-9004-576c99a811ce",
									name: "Dynamic Watermark Product"
								},
								start: 0,
								period: 30,
								price: 12.49
							}
						]
					},
					quantity:1
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});

	});

	describe('Mixed Sale with Dynamic Product Schedule', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: {
						schedule:[
							{
								product: {
									id: "aba9a683-85a4-45e7-9004-576c99a811ce",
									name: "Dynamic Watermark Product"
								},
								start: 0,
								period: 30,
								price: 12.49
							}
						]
					},
					quantity:1
				}],
				products:[{
					product: "aba9a683-85a4-45e7-9004-576c99a811ce",
					quantity:2,
					price: 12.99
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});

	});

});
