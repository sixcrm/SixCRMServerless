
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

function checkoutShouldFail(token, post_body){

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
			expect(result.response.statusCode).to.equal(400);
			expect(result.response.statusMessage).to.not.equal('OK');
			expect(result.body).to.have.property('success');
			expect(result.body).to.have.property('code');
			expect(result.body).to.have.property('response');
			expect(result.body.success).to.equal(false);
			expect(result.body.code).to.equal(400);
			return result.body;
		});

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
					product_schedule: "0e3652bf-f1d3-4325-840e-c93806289d7e",
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
					let validated = global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				})

		});

		it('fails when a products schedule has more than one product', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: "12529a17-ac32-4e46-b05b-83862843055d",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkoutShouldFail(token, checkout_body);
				})
		});

		it('fails when a more than one product schedule is being purchased', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: "12529a17-ac32-4e46-b05b-83862843055d",
					quantity:2
				},{
					product_schedule: "0e3652bf-f1d3-4325-840e-c93806289d7e",
					quantity:2
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkoutShouldFail(token, checkout_body);
				})
		});
	});

	describe('Straight Sale', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2,
					amount: 12.99
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});
	});

	describe('Mixed Sale', () => {
		it('returns a confirmed sale', () => {

			let sale_object = {
				product_schedules:[{
					product_schedule: "0e3652bf-f1d3-4325-840e-c93806289d7e",
					quantity:2
				}],
				products:[{
					product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
					quantity:2,
					amount: 12.99
				}]
			};

			return acquireToken(campaign)
				.then((token) => {
					expect(token).to.be.defined;
					let checkout_body = createCheckoutBody(campaign, sale_object);

					return checkout(token, checkout_body);
				})
				.then(result => {
					let validated = global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/checkout/response.json'));

					expect(validated).to.equal(true);
				});

		});

	});

});
