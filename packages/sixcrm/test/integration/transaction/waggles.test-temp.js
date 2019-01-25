const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/lib/providers/http-provider').default;
const httpprovider = new HttpProvider();
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const signatureutilities = require('@6crm/sixcrmcore/lib/util/signature').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
//const tu = require('@6crm/sixcrmcore/lib/util/test-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function createSignature() {

	let request_time = timestamp.createTimestampMilliseconds();
	let secret_key = config.access_keys.super_user.secret_key;
	let access_key = config.access_keys.super_user.access_key;
	let signature = signatureutilities.createSignature(secret_key, request_time);

	return access_key + ':' + request_time + ':' + signature;

}

function createAffiliates() {

	let affiliates = null;

	arrayutilities.map(['affiliate', 'subaffiliate1', 'subaffiliate2', 'subaffiliate3', 'subaffiliate4', 'subaffiliate5', 'cid'], (field) => {
		if (random.randomBoolean()) {
			if (_.isNull(affiliates)) {
				affiliates = {};
			}
			affiliates[field] = random.createRandomString(20);
		}
	});

	return affiliates;

}

function getValidAcquireTokenPostBody(campaign) {

	let affiliates = createAffiliates();

	let return_object = {
		campaign: (_.has(campaign, 'id')) ? campaign.id : campaign
	};

	if (!_.isNull(affiliates)) {
		return_object.affiliates = affiliates;
	}

	return return_object;

}

function confirmOrder(token, session) {

	du.info('Confirm Order');

	let account = config.account;

	let querystring = httpprovider.createQueryString({
		session: session
	});

	let argument_object = {
		//Technical Debt:  This is a hack - http-provider.js should be adding the querystring from the qs parameter
		url: config.endpoint + 'order/confirm/' + account + '?' + querystring,
		headers: {
			Authorization: token
		}
	};

	return httpprovider.getJSON(argument_object)
		.then((result) => {
			du.debug(result.body);
			expect(result.response.statusCode).to.equal(200);
			expect(result.response.statusMessage).to.equal('OK');
			expect(result.body).to.have.property('success');
			expect(result.body).to.have.property('code');
			expect(result.body).to.have.property('response');
			expect(result.body.success).to.equal(true);
			expect(result.body.code).to.equal(200);


			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json'));

			expect(validated).to.equal(true);
			return result.body;
		});

}

function createUpsell(token, session, upsell_object) {

	du.info('Create Upsell');

	let account = config.account;
	let post_body = createOrderBody(session, upsell_object);

	delete post_body.creditcard;
	post_body.transaction_subtype = 'upsell1';

	let argument_object = {
		url: config.endpoint + 'order/create/' + account,
		body: post_body,
		headers: {
			Authorization: token
		}
	};

	du.info('Upsell', argument_object);

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

			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model', 'endpoints/createOrder/response.json'))

			expect(validated).to.equal(true);

			return result.body;

		});

}

function createOrder(token, session, sale_object, creditcard) {

	du.info('Create Order');

	let account = config.account;
	let post_body = createOrderBody(session, sale_object, creditcard);

	let argument_object = {
		url: config.endpoint + 'order/create/' + account,
		body: post_body,
		headers: {
			Authorization: token
		}
	};

	du.info('Order', argument_object);

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

			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model', 'endpoints/createOrder/response.json'))

			expect(validated).to.equal(true);

			return result.body;
		});

}

function createLead(token, campaign, customer) {

	du.info('Create Lead');
	let account = config.account;
	let post_body = createLeadBody(campaign, customer);

	let argument_object = {
		url: config.endpoint + 'lead/create/' + account,
		body: post_body,
		headers: {
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
			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model', 'endpoints/createLead/response.json'))

			expect(validated).to.equal(true);
			return result.body.response.id;
		});

}

function acquireToken(campaign) {

	du.info('Acquire Token');

	let account = config.account;
	let authorization_string = createSignature();
	var post_body = getValidAcquireTokenPostBody(campaign);

	let argument_object = {
		url: config.endpoint + 'token/acquire/' + account,
		body: post_body,
		headers: {
			Authorization: authorization_string
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
			expect(_.isString(result.body.response)).to.equal(true);
			let authorization_token = result.body.response;

			return authorization_token;
		});

}

function createCustomer(customer) {

	if (_.isUndefined(customer) || _.isNull(customer)) {

		customer = MockEntities.getValidCustomer();

		delete customer.id;
		delete customer.account;
		delete customer.created_at;
		delete customer.updated_at;
		delete customer.creditcards;
		customer.billing = customer.address;

	}

	return customer;

}

function createCreditCard(creditcard) {

	if (_.isUndefined(creditcard) || _.isNull(creditcard)) {

		creditcard = MockEntities.getValidTransactionCreditCard();

		creditcard.number = "4111111111111111";

	}

	return creditcard;

}

function createLeadBody(campaign, customer) {

	let return_object = {
		campaign: (_.has(campaign, 'id')) ? campaign.id : campaign,
		customer: createCustomer(customer)
	};

	let affiliates = createAffiliates();

	if (!_.isNull(affiliates)) {
		return_object.affiliates = affiliates;
	}

	return return_object;

}

function createOrderBody(session, sale_object, creditcard) {

	let return_object = objectutilities.clone(sale_object);

	return_object.session = session;
	return_object.creditcard = createCreditCard(creditcard);
	return_object.transaction_subtype = 'main';

	return return_object;

}

let config = global.SixCRM.routes.include('test', 'integration/config/' + process.env.stage + '.yml');
let campaign = '71c3cac1-d084-4e12-ac75-cdb28987ae16';

describe('Transaction Endpoints Round Trip Test', () => {

	let correct_config = config;

	before(() => {
		config = global.SixCRM.routes.include('test', 'integration/config/production.yml');
		config.account = 'cb4a1482-1093-4d8e-ad09-fdd4d840b497';
	});

	after(() => {
		config = correct_config;
	});


	describe('Test Case 1', () => {

		it('successfully executes', () => {

			let upsell_object = {
				products: [{
					quantity: 1,
					product: "6c6ec904-5315-4214-a057-79a7ff308cde",
					price: 1.01
				}]
			};

			let sale_object = {
				product_schedules: [{
					quantity: 1,
					product_schedule: {
						schedule: [{
							product: {
								id: "6c6ec904-5315-4214-a057-79a7ff308cde",
								name: "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
							},
							price: 1.00,
							start: 0,
							period: 14
						},
						{
							product: {
								id: "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
								name: "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
							},
							price: 1.00,
							start: 0,
							period: 14
						}
						]
					}
				}]
			};

			let customer = {
				"firstname": "Kristopher",
				"lastname": "Trujillo",
				"email": "kris@sixcrm.com",
				"phone": "1234567890",
				"billing": {
					"line1": "4120 Canal Rd.",
					"city": "Lake Oswego",
					"state": "OR",
					"zip": "97034",
					"country": "US"
				},
				"address": {
					"line1": "4120 Canal Rd.",
					"city": "Lake Oswego",
					"state": "OR",
					"zip": "97034",
					"country": "US"
				}
			};

			let creditcard = {
				"number": "4737023965504065",
				"expiration": "04/2021",
				"cvv": "652",
				"name": "Kristopher Trujillo",
				"address": {
					"line1": "4120 Canal Rd.",
					"city": "Lake Oswego",
					"state": "OR",
					"zip": "97034",
					"country": "US"
				}
			}

			return acquireToken(campaign)
				.then((token) => {

					return createLead(token, campaign, customer)
						.then((session) => {
							//du.info(session);  process.exit();
							return createOrder(token, session, sale_object, creditcard)
								.then((create_order_result) => {
									expect(create_order_result.response).to.have.property('amount');
									du.info('First Request: ' + create_order_result.response.amount);
									expect(create_order_result.response.amount).to.equal(2.00);
									return;
								})
								.then(() => createUpsell(token, session, upsell_object))
								.then((create_order_result) => {
									expect(create_order_result.response).to.have.property('amount');
									du.info('Second Request: ' + create_order_result.response.amount);
									expect(create_order_result.response.amount).to.equal(1.01);
									return;
								})
								.then(() => confirmOrder(token, session))
								.then((result) => {
									du.warning(result);
									return;
								});
						});

				});

		});

	});

});
