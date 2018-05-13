

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const _ = require('lodash');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidTransaction(){
	return MockEntities.getValidTransaction();
}

function getValidCustomer(id){
	return MockEntities.getValidCustomer(id);
}

function getValidCreditCard(id){
	return MockEntities.getValidCreditCard(id);
}

function getValidMerchantProvider(id){

	return MockEntities.getValidMerchantProvider(id, 'Stripe');

}

function getValidCreateRefundsResponse(response_type, action){

	response_type = (_.includes(['success','fail'], response_type))?response_type:'success';
	action = (_.includes(['refund','reverse'], response_type))?response_type:'refund';

	let responses = {
		refund: {
			fail: {
				Error: new Error('Charge ch_1BplY42eZvKYlo2CUbB0cWgc has already been refunded.'),
				type: 'StripeInvalidRequestError',
				rawType: 'invalid_request_error',
				code: undefined,
				param: undefined,
				message: 'Charge ch_1BplY42eZvKYlo2CUbB0cWgc has already been refunded.',
				detail: undefined,
				requestId: 'req_91FIInKTqgBTO4',
				statusCode: 400
			},
			success:{
				id: "re_1BphTm2eZvKYlo2CzVsCt4UN",
				object: "refund",
				amount: 1272,
				balance_transaction: "txn_1BphTm2eZvKYlo2CbyFQ8UJ7",
				charge: "ch_1BphTb2eZvKYlo2CLDRe9rmp",
				created: 1517250942,
				currency: "usd",
				metadata: {
				},
				reason: null,
				receipt_number: null,
				status: "succeeded"
			}
		},
		reverse:{
			fail:{
				Error: new Error('Charge ch_1Bpmvj2eZvKYlo2CThhjTf1Z has already been refunded.'),
				type: 'StripeInvalidRequestError',
				rawType: 'invalid_request_error',
				code: undefined,
				param: undefined,
				message: 'Charge ch_1Bpmvj2eZvKYlo2CThhjTf1Z has already been refunded.',
				detail: undefined,
				requestId: 'req_09mgu8TzGsHhUS',
				statusCode: 400
			},
			success:{
				id: 're_1BpmxP2eZvKYlo2CbzdD4xv9',
				object: 'refund',
				amount: 3000,
				balance_transaction: 'txn_1BpmxP2eZvKYlo2C9QCl34dZ',
				charge: 'ch_1Bpmvj2eZvKYlo2CThhjTf1Z',
				created: 1517271999,
				currency: 'usd',
				metadata: {},
				reason: null,
				receipt_number: null,
				status: 'succeeded'
			}
		}
	};

	return responses[action][response_type];

}

function getValidCreateChargeResponse(response_type){

	response_type = (_.includes(['success','decline'], response_type))?response_type:'success';

	let responses = {
		success: {
			id: 'ch_1BplY42eZvKYlo2CUbB0cWgc',
			object: 'charge',
			amount: 3000,
			amount_refunded: 0,
			application: null,
			application_fee: null,
			balance_transaction: 'txn_1BplY42eZvKYlo2CnYz0eqMC',
			captured: true,
			created: 1517266584,
			currency: 'usd',
			customer: null,
			description: null,
			destination: null,
			dispute: null,
			failure_code: null,
			failure_message: null,
			fraud_details: {},
			invoice: null,
			livemode: false,
			metadata: {},
			on_behalf_of: null,
			order: null,
			outcome:
      { network_status: 'approved_by_network',
      	reason: null,
      	risk_level: 'normal',
      	seller_message: 'Payment complete.',
      	type: 'authorized' },
			paid: true,
			receipt_email: null,
			receipt_number: null,
			refunded: false,
			refunds:
      { object: 'list',
      	data: [],
      	has_more: false,
      	total_count: 0,
      	url: '/v1/charges/ch_1BplY42eZvKYlo2CUbB0cWgc/refunds' },
			review: null,
			shipping: null,
			source:
      { id: 'card_1BplY42eZvKYlo2CIPi0AUjd',
      	object: 'card',
      	address_city: null,
      	address_country: null,
      	address_line1: null,
      	address_line1_check: null,
      	address_line2: null,
      	address_state: null,
      	address_zip: null,
      	address_zip_check: null,
      	brand: 'Visa',
      	country: 'US',
      	customer: null,
      	cvc_check: 'pass',
      	dynamic_last4: null,
      	exp_month: 2,
      	exp_year: 2018,
      	fingerprint: 'Xt5EWLLDS7FJjR1c',
      	funding: 'credit',
      	last4: '4242',
      	metadata: {},
      	name: null,
      	tokenization_method: null },
			source_transfer: null,
			statement_descriptor: null,
			status: 'succeeded',
			transfer_group: null
		},
		decline: {
			Error: new Error('Your card was declined.'),
			rawType: 'card_error',
			code: 'card_declined',
			param: undefined,
			message: 'Your card was declined.',
			detail: undefined,
			statusCode: 402
		}
	};

	return responses[response_type];

}

function getValidListChargesResponse(response_type){

	response_type = (_.includes(['success','fail'], response_type))?response_type:'success';

	let responses = {
		success: {
			object: 'list',
			data:[
				{
					id: 'ch_1BpklI2eZvKYlo2Cqq6KfIUC',
					object: 'charge',
					amount: 999,
					amount_refunded: 0,
					application: null,
					application_fee: null,
					balance_transaction: null,
					captured: false,
					created: 1517263560,
					currency: 'usd',
					customer: 'cus_9Szxg6DBV2cuZU',
					description: null,
					destination: null,
					dispute: null,
					failure_code: 'expired_card',
					failure_message: 'Your card has expired.',
					fraud_details: {},
					invoice: 'in_1Bpjp92eZvKYlo2C4YDN6s6C',
					livemode: false,
					metadata: {},
					on_behalf_of: null,
					order: null,
					outcome:
          { network_status: 'declined_by_network',
          	reason: 'expired_card',
          	risk_level: 'normal',
          	seller_message: 'The bank returned the decline code `expired_card`.',
          	type: 'issuer_declined' },
					paid: false,
					receipt_email: null,
					receipt_number: null,
					refunded: false,
					refunds:
          { object: 'list',
          	data: [],
          	has_more: false,
          	total_count: 0,
          	url: '/v1/charges/ch_1BpklI2eZvKYlo2Cqq6KfIUC/refunds' },
					review: null,
					shipping: null,
					source:
          { id: 'card_19A3wv2eZvKYlo2CKWsLMsZi',
          	object: 'card',
          	address_city: null,
          	address_country: null,
          	address_line1: null,
          	address_line1_check: null,
          	address_line2: null,
          	address_state: null,
          	address_zip: null,
          	address_zip_check: null,
          	brand: 'Visa',
          	country: 'US',
          	customer: 'cus_9Szxg6DBV2cuZU',
          	cvc_check: null,
          	dynamic_last4: null,
          	exp_month: 12,
          	exp_year: 2017,
          	fingerprint: 'Xt5EWLLDS7FJjR1c',
          	funding: 'credit',
          	last4: '4242',
          	metadata: {},
          	name: null,
          	tokenization_method: null },
					source_transfer: null,
					statement_descriptor: null,
					status: 'failed',
					transfer_group: null
				}
			],
			has_more: true,
			url: '/v1/charges'
		},
		fail:{
			Error: new Error('Invalid API Key provided: ****************NYHT'),
			type: 'StripeAuthenticationError',
			rawType: 'invalid_request_error',
			code: undefined,
			param: undefined,
			message: 'Invalid API Key provided: ****************NYHT',
			detail: undefined,
			requestId: undefined,
			statusCode: 401
		}
	};

	return responses[response_type];

}

function getValidCustomerTokenResponse({no_shipping = false}){

	let shipping = {
		address:{
			city: 'North Hortensehaven',
      country: 'IE',
      line1: '624 Verla Grove',
      line2: 'Apt. 567',
      postal_code: '57342',
      state: 'OH' },
     name: 'Elyssa Monahan',
     phone: null
	 };

	return {
		id: 'cus_CqlTb4SdvwWQVe',
	  object: 'customer',
	  account_balance: 0,
	  created: 1526155438,
	  currency: null,
	  default_source: 'card_1CR3wg2eZvKYlo2CD6ynE4P5',
	  delinquent: false,
	  description: null,
	  discount: null,
	  email: 'Travon.Hamill@carroll.net',
	  invoice_prefix: '7C178DF',
	  livemode: false,
	  metadata: {},
	  shipping: (no_shipping == true)?null:shipping,
	  sources:
	   { object: 'list',
	     data: [],
	     has_more: false,
	     total_count: 1,
	     url: '/v1/customers/cus_CqlTb4SdvwWQVe/sources' },
	  subscriptions:
	   { object: 'list',
	     data: [],
	     has_more: false,
	     total_count: 0,
	     url: '/v1/customers/cus_CqlTb4SdvwWQVe/subscriptions' }
		};

}

function getValidCreditCardTokenResponse({no_address = false, no_name = false}){

	return {
		id: 'tok_1CR3Cv2eZvKYlo2CQuBxo5jG',
	  object: 'token',
	  card:
	   { id: 'card_1CR3Cv2eZvKYlo2C45Uj1SD2',
	     object: 'card',
	     address_city: (no_address == false)?'North Evieville':null,
	     address_country: (no_address == false)?'US':null,
	     address_line1: (no_address == false)?'9882 Lucious Course':null,
	     address_line1_check: (no_address == false)?'unchecked':null,
	     address_line2: (no_address == false)?'Apt. 770':null,
	     address_state: (no_address == false)?'WA':null,
	     address_zip: (no_address == false)?'96712-2135':null,
	     address_zip_check: (no_address == false)?'unchecked':null,
	     brand: 'Visa',
	     country: 'US',
	     currency: 'usd',
	     cvc_check: null,
	     dynamic_last4: null,
	     exp_month: 11,
	     exp_year: 2018,
	     fingerprint: 'Xt5EWLLDS7FJjR1c',
	     funding: 'credit',
	     last4: '4242',
	     metadata: {},
	     name: (no_name == false)?'Althea Hudson':null,
	     tokenization_method: null },
	  client_ip: '24.21.201.140',
	  created: 1526152601,
	  livemode: false,
	  type: 'card',
	  used: false
	};

}

describe('vendors/merchantproviders/Stripe.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			let merchant_provider = getValidMerchantProvider();
			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			expect(objectutilities.getClassName(stripeController)).to.equal('StripeController');

		});

	});

	describe('test', () => {

		it('successfully returns a failure', () => {

			let merchant_provider = getValidMerchantProvider();
			let response = getValidListChargesResponse('fail');

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				listCharges(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: response
						},
						body: response
					});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.test().then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('fail');
				expect(result.getResult().message).to.equal('Failed');

			});

		});

		it('successfully returns a success', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let response = getValidListChargesResponse('success');

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				listCharges(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: response
						},
						body: response
					});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.test().then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

	});

	describe('process', () => {

		it('successfully processes a transaction', () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'

			let amount = 2.00;

			let charge_response = getValidCreateChargeResponse('success');
			let token_response = getValidCreditCardTokenResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = 'cus_CqlTb4SdvwWQVe';
			let creditcard_tag = MockEntities.getValidTag();
			creditcard_tag.key = 'stripe_token';
			creditcard_tag.value = 'card_1CR3Cv2eZvKYlo2C45Uj1SD2';

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					if(id == customer.id){
						return Promise.resolve(customer_tag);
					}
					return Promise.resolve(creditcard_tag);

				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCharge(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: charge_response
						},
						body: charge_response
					});
				}
				getCreditCard(token){
					expect(token).to.be.a('string');
					return Promise.resolve(token_response);
				}
				getToken(token){
					expect(token).to.be.a('string');
					return Promise.resolve(token_response);
				}
				createToken(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.process({customer: customer, creditcard: creditcard, amount: amount}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');
			});

		});

		it('successfully declines a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();
			let creditcard = getValidCreditCard();

			creditcard.number = '4000000000000002';
			let amount = 30.00;

			let charge_response = getValidCreateChargeResponse('decline');
			let token_response = getValidCreditCardTokenResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = 'cus_CqlTb4SdvwWQVe';
			let creditcard_tag = MockEntities.getValidTag();
			creditcard_tag.key = 'stripe_token';
			creditcard_tag.value = 'card_1CR3Cv2eZvKYlo2C45Uj1SD2';

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					if(id == customer.id){
						return Promise.resolve(customer_tag);
					}
					return Promise.resolve(creditcard_tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCharge(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: charge_response
						},
						body: charge_response
					});
				}
				getCreditCard(token){
					expect(token).to.be.a('string');
					return Promise.resolve(token_response);
				}
				createToken(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.process({customer: customer, creditcard: creditcard, amount: amount}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('fail');
				expect(result.getResult().message).to.equal('Failed');
			});

		});

	});

	describe('refund', () => {

		it('successfully fails to refund a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let refund_response = getValidCreateRefundsResponse('fail');

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createRefund(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: refund_response
						},
						body: refund_response
					});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.refund({transaction: transaction}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('fail');
				expect(result.getResult().message).to.equal('Failed');
			});

		});

		it('successfully refunds a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let refund_response = getValidCreateRefundsResponse('success');

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createRefund(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: refund_response
						},
						body: refund_response
					});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.refund({transaction: transaction}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');
			});

		});

	});

	describe('reverse', () => {

		it('successfully fails to reverse a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let reverse_response = getValidCreateRefundsResponse('fail', 'reverse');

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createRefund(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: reverse_response
						},
						body: reverse_response
					});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.refund({transaction: transaction}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('fail');
				expect(result.getResult().message).to.equal('Failed');
			});

		});

		it('successfully refunds a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let refund_response = getValidCreateRefundsResponse('success','reverse');

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createRefund(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: refund_response
						},
						body: refund_response
					});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.refund({transaction: transaction}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');
			});

		});

	});

	describe('_createCardToken', async () => {

		it('successfully creates a card token when shipping information is present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'

			let token_response = getValidCreditCardTokenResponse({});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCreditCard(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('tok_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('token');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token.card).to.have.property('name');
			expect(creditcard_token.card.name).is.a('string');
			expect(creditcard_token.card.address_line1).is.a('string');
			expect(creditcard_token.card.address_city).is.a('string');
			expect(creditcard_token.card.address_state).is.a('string');
			expect(creditcard_token.card.address_country).is.a('string');
			expect(creditcard_token.card.address_state).is.a('string');


		});

		it('successfully creates a card token when shipping address information is not present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'
			delete creditcard.address;

			let token_response = getValidCreditCardTokenResponse({no_address: true});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCreditCard(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			//console.log(creditcard_token);  process.exit();
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('tok_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('token');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token.card).to.have.property('name');
			expect(creditcard_token.card.name).is.a('string');
			expect(creditcard_token.card.address_line1).is.a('null');
			expect(creditcard_token.card.address_city).is.a('null');
			expect(creditcard_token.card.address_state).is.a('null');
			expect(creditcard_token.card.address_country).is.a('null');
			expect(creditcard_token.card.address_state).is.a('null');

		});

		it('successfully creates a card token when shipping address information is not present and name is not present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'
			delete creditcard.address;
			delete creditcard.name;

			let token_response = getValidCreditCardTokenResponse({no_address: true, no_name: true});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCreditCard(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('tok_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('token');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token.card).to.have.property('name');
			expect(creditcard_token.card.name).is.a('null');
			expect(creditcard_token.card.address_line1).is.a('null');
			expect(creditcard_token.card.address_city).is.a('null');
			expect(creditcard_token.card.address_state).is.a('null');
			expect(creditcard_token.card.address_country).is.a('null');
			expect(creditcard_token.card.address_state).is.a('null');

		});

		it('successfully creates a card token when name is not present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'
			delete creditcard.name;

			let token_response = getValidCreditCardTokenResponse({no_name: true});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCreditCard(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('tok_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('token');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token.card).to.have.property('name');
			expect(creditcard_token.card.name).is.a('null');
			expect(creditcard_token.card.address_line1).is.a('string');
			expect(creditcard_token.card.address_city).is.a('string');
			expect(creditcard_token.card.address_state).is.a('string');
			expect(creditcard_token.card.address_country).is.a('string');
			expect(creditcard_token.card.address_state).is.a('string');

		});

	});

	describe('_createCustomer', async () => {

		it('successfully creates a customer', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let token_response = getValidCreditCardTokenResponse({no_name: true});
			token_response.id = 'tok_mastercard';

			let customer_response = getValidCustomerTokenResponse({});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID(entity){
					expect(entity).to.be.defined;
					if(_.has(entity, 'id')){
						return entity.id;
					}
					return entity;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let customer_token = await stripeController._createCustomer({customer: customer, stripe_creditcard: token_response});
			expect(customer_token).to.have.property('id');
			expect(customer_token).to.have.property('object');
			expect(customer_token.id).to.have.string('cus_');
			expect(customer_token.object).to.equal('customer');
			expect(customer_token).to.have.property('shipping');
			expect(customer_token.shipping).to.be.a('object');

		});

		it('successfully creates a customer when shipping information is absent', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();
			delete customer.address;

			let token_response = getValidCreditCardTokenResponse({no_name: true});
			token_response.id = 'tok_mastercard';

			let customer_response = getValidCustomerTokenResponse({no_shipping: true});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID(entity){
					expect(entity).to.be.defined;
					if(_.has(entity, 'id')){
						return entity.id;
					}
					return entity;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let customer_token = await stripeController._createCustomer({customer: customer, stripe_creditcard: token_response});
			expect(customer_token).to.have.property('id');
			expect(customer_token).to.have.property('object');
			expect(customer_token.id).to.have.string('cus_');
			expect(customer_token.object).to.equal('customer');
			expect(customer_token).to.have.property('shipping');
			expect(customer_token.shipping).to.be.a('null');

		});

	});

});
