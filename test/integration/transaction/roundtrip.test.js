
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const tu = global.SixCRM.routes.include('lib','test-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const signatureutilities = global.SixCRM.routes.include('lib','signature.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function createSignature(){

	let request_time = timestamp.createTimestampMilliseconds();
	let secret_key = config.access_keys.super_user.secret_key;
	let access_key = config.access_keys.super_user.access_key;
	let signature = signatureutilities.createSignature(secret_key, request_time);

	return access_key+':'+request_time+':'+signature;

}

function createAffiliates(){

	let affiliates = null;

	arrayutilities.map(['affiliate', 'subaffiliate1', 'subaffiliate2', 'subaffiliate3', 'subaffiliate4', 'subaffiliate5', 'cid'], (field) => {
		if(random.randomBoolean()){
			if(_.isNull(affiliates)){
				affiliates = {};
			}
			affiliates[field] = random.createRandomString(20);
		}
	});

	return affiliates;

}

function getValidAcquireTokenPostBody(campaign){

	let affiliates = createAffiliates();

	let return_object = {
		campaign:(_.has(campaign, 'id'))?campaign.id:campaign
	};

	if(!_.isNull(affiliates)){
		return_object.affiliates = affiliates;
	}

	return return_object;

}

function confirmOrder(token, session){

	du.info('Confirm Order');

	let account = config.account;

	let querystring = httpprovider.createQueryString({session: session});

	let argument_object = {
		//Technical Debt:  This is a hack - http-provider.js should be adding the querystring from the qs parameter
		url: config.endpoint+'order/confirm/'+account+'?'+querystring,
		headers:{
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

function createUpsell(token, session, sale_object, previous_order){

	du.info('Create Upsell');

	const account = config.account;
	const post_body = createOrderBody(session, sale_object);

	delete post_body.creditcard;
	post_body.transaction_subtype = 'upsell1';

	if (previous_order) {
		const previous_rebill_alias = previous_order.response.order.id;
		post_body.reverse_on_complete = previous_rebill_alias;
	}

	let argument_object = {
		url: config.endpoint+'order/create/'+account,
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

			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model','endpoints/createOrder/response.json'))

			expect(validated).to.equal(true);

			return result.body;

		});

}

function createOrder(token, session, sale_object, customer){

	du.info('Create Order');

	let account = config.account;
	let post_body = createOrderBody(session, sale_object, customer);

	let argument_object = {
		url: config.endpoint+'order/create/'+account,
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

			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model','endpoints/createOrder/response.json'))

			expect(validated).to.equal(true);

			return result.body;
		});

}

function createLead(token, campaign, customer){

	du.info('Create Lead');
	let account = config.account;
	let post_body = createLeadBody(campaign, customer);

	let argument_object = {
		url: config.endpoint+'lead/create/'+account,
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
			let validated = global.SixCRM.validate(result.body.response, global.SixCRM.routes.path('model','endpoints/createLead/response.json'))

			expect(validated).to.equal(true);
			return result.body.response.id;
		});

}

function acquireToken(campaign){

	du.info('Acquire Token');

	let account = config.account;
	let authorization_string = createSignature();
	var post_body = getValidAcquireTokenPostBody(campaign);

	let argument_object = {
		url: config.endpoint+'token/acquire/'+account,
		body: post_body,
		headers:{
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

function createCustomer(){

	let customer = MockEntities.getValidCustomer();

	delete customer.id;
	delete customer.account;
	delete customer.created_at;
	delete customer.updated_at;
	delete customer.creditcards;
	customer.billing = customer.address;

	return customer;

}

function createCreditCard(){

	let creditcard = MockEntities.getValidTransactionCreditCard();

	creditcard.number = "4111111111111111";

	return creditcard;

}

function createLeadBody(campaign, customer){

	let return_object = {
		campaign:(_.has(campaign, 'id'))?campaign.id:campaign,
		customer: customer || createCustomer()
	};

	let affiliates = createAffiliates();

	if(!_.isNull(affiliates)){ return_object.affiliates = affiliates; }

	return return_object;

}

function createOrderBody(session, sale_object, customer){

	let return_object = objectutilities.clone(sale_object);

	return_object.session = session;
	return_object.creditcard = createCreditCard();
	return_object.transaction_subtype = 'main';

	if (customer) {
		return_object.customer = customer;
	}

	return return_object;

}

let config = global.SixCRM.routes.include('test', 'integration/config/'+process.env.stage+'.yml');
let campaign = '70a6689a-5814-438b-b9fd-dd484d0812f9';

describe('Transaction Endpoints Round Trip Test',() => {
	describe('Straight Sale', () => {
		it('successfully executes', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(() => confirmOrder(token, session));
						});

				});

		});

		it('succeeds with partial customer lead', () => {
			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					const customer = createCustomer();
					const customerPartial = { email: customer.email };
					return createLead(token, campaign, customerPartial)
						.then((session) => {
							return createOrder(token, session, sale_object, customer)
								.then(() => confirmOrder(token, session));
						});

				});
		});

	});

	describe('Straight Sale with Upsell', () => {
		it('successfully executes', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}]
			};

			let upsale_sale_object = {
				products:[{
					product: "4d3419f6-526b-4a68-9050-fc3ffcb552b4",
					quantity:1
				}]
			};

			return acquireToken(campaign)
				.then((token) => {

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(response => createUpsell(token, session, upsale_sale_object, response))
								.then(() => confirmOrder(token, session));
						});

				});

		});

	});

	describe('Product Schedule Sale', () => {
		it('successfully executes', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: "12529a17-ac32-4e46-b05b-83862843055d",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(() => confirmOrder(token, session));
						});

				});

		});

	});

	describe('Mixed Sale', () => {
		it('successfully executes', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2
				}],
				product_schedules:[{
					product_schedule: "12529a17-ac32-4e46-b05b-83862843055d",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(() => confirmOrder(token, session));
						});

				});

		});

	});

	describe('Dynamically Priced Products', () => {
		it('successfully executes', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2,
					price: 12.99
				}]
			};

			return acquireToken(campaign)
				.then((token) => {

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(() => confirmOrder(token, session));
						});

				});

		});

	});

	describe('Dynamic Product Schedule', () => {
		it('successfully executes', () => {

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

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(() => confirmOrder(token, session));
						});

				});

		});

	});

	describe('Dynamic Product Schedule', () => {
		it('successfully executes', () => {

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

					return createLead(token, campaign)
						.then((session) => {
							return createOrder(token, session, sale_object)
								.then(() => confirmOrder(token, session));
						});

				});

		});

	});

});
