

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const _ = require('lodash');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

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

function getValidCreditCardTokenResponse(){

	return {
		id: 'tok_1C1HFO2eZvKYlo2CFjOABvIr',
		object: 'token',
		card:
     { id: 'card_1C1HFO2eZvKYlo2CNa4aHEwG',
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
     	cvc_check: 'unchecked',
     	dynamic_last4: null,
     	exp_month: 7,
     	exp_year: 2018,
     	fingerprint: 'Xt5EWLLDS7FJjR1c',
     	funding: 'credit',
     	last4: '4242',
     	metadata: {},
     	name: null,
     	tokenization_method: null },
		client_ip: '71.193.160.163',
		created: 1520010042,
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

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				charges: {
					list: (input, callback) => {
						callback(response, null);
					}
				}
			}

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

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				charges: {
					list: (input, callback) => {
						callback(null, response);
					}
				}
			}

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
			let token_response = getValidCreditCardTokenResponse();

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				charges: {
					create: (input, callback) => {
						callback(null, charge_response);
					}
				},
				tokens:{
					create: (input, callback) => {
						callback(null, token_response)
					}
				}
			}

			return stripeController.process({customer: customer, creditcard: creditcard, amount: amount}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				du.info(result.getResult());
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');
			});

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
		let token_response = getValidCreditCardTokenResponse();

		const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
		let stripeController = new StripeController({merchant_provider: merchant_provider});

		stripeController.stripe = {
			charges: {
				create: (input, callback) => {
					callback(null, charge_response);
				}
			},
			tokens:{
				create: (input, callback) => {
					callback(null, token_response)
				}
			}
		}

		return stripeController.process({customer: customer, creditcard: creditcard, amount: amount}).then(result => {
			expect(result.getResult()).to.have.property('code');
			expect(result.getResult()).to.have.property('message');
			expect(result.getResult()).to.have.property('response');
			expect(result.getResult().code).to.equal('fail');
			expect(result.getResult().message).to.equal('Failed');
		});

	});

	describe('refund', () => {

		it('successfully fails to refund a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let response = getValidCreateRefundsResponse('fail');

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				refunds: {
					create: (input, callback) => {
						callback(response, null);
					}
				}
			};

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

			let response = getValidCreateRefundsResponse('success');

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				refunds: {
					create: (input, callback) => {
						callback(null, response);
					}
				}
			};

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

			let response = getValidCreateRefundsResponse('fail', 'reverse');

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				refunds: {
					create: (input, callback) => {
						callback(response, null);
					}
				}
			};

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

			let response = getValidCreateRefundsResponse('success','reverse');

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			stripeController.stripe = {
				refunds: {
					create: (input, callback) => {
						callback(null, response);
					}
				}
			};

			return stripeController.refund({transaction: transaction}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');
			});

		});

	});

});
