let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const _ = require('lodash');
let du = require('@6crm/sixcrmcore/util/debug-utilities').default;
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
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

function getValidSourceResponse({no_address = false, no_name = false} = {}){

	return {
		id: 'src_1CRRZY2eZvKYlo2CYXdzNnZq',
		object: 'source',
		amount: null,
		card:
		 { exp_month: 9,
			 exp_year: 2020,
			 address_line1_check: 'unchecked',
			 address_zip_check: 'unchecked',
			 brand: 'Visa',
			 card_automatically_updated: false,
			 country: 'US',
			 fingerprint: 'Xt5EWLLDS7FJjR1c',
			 funding: 'credit',
			 last4: '4242',
			 three_d_secure: 'optional',
			 cvc_check: null,
			 tokenization_method: null,
			 dynamic_last4: null },
		client_secret: 'src_client_secret_Cr9tlAFYXu5ojt9GwBmArtBp',
		created: 1526246260,
		currency: 'usd',
		customer: 'cus_Cr9tqY83W2v98i',
		flow: 'none',
		livemode: false,
		metadata: {},
		owner:
		 { address: (no_address == true)?null:{ city: 'Sengerland',
			 country: 'US',
			 line1: '63163 Amalia Views',
			 line2: 'Suite 985',
			 postal_code: '96482-2190',
			 state: 'NM' },
			 email: null,
			 name: (no_name == true)?null:'Athena Ratke',
			 phone: null,
			 verified_address: null,
			 verified_email: null,
			 verified_name: null,
			 verified_phone: null },
		statement_descriptor: null,
		status: 'chargeable',
		type: 'card',
		usage: 'reusable' };

}

function getValidCreateRefundsResponse(response_type, action){

	response_type = (_.includes(['success','error'], response_type))?response_type:'success';
	action = (_.includes(['refund','reverse'], response_type))?response_type:'refund';

	let responses = {
		refund: {
			error: {
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
			error:{
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
			id: 'ch_1CRRSz2eZvKYlo2CizPAvgwo',
			object: 'charge',
			amount: 200,
			amount_refunded: 0,
			application: null,
			application_fee: null,
			balance_transaction: 'txn_1CRRSz2eZvKYlo2Ci5R8mjFg',
			captured: true,
			created: 1526245853,
			currency: 'usd',
			customer: 'cus_Cr9mdmoPxd9Su3',
			description: 'SixCRM.com',
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
			outcome: {
				network_status: 'approved_by_network',
				reason: null,
				risk_level: 'normal',
				seller_message: 'Payment complete.',
				type: 'authorized'
			},
			paid: true,
			receipt_email: null,
			receipt_number: null,
			refunded: false,
			refunds: {
				object: 'list',
				data: [],
				has_more: false,
				total_count: 0,
				url: '/v1/charges/ch_1CRRSz2eZvKYlo2CizPAvgwo/refunds'
			},
			review: null,
			shipping: {
				address: {
					city: 'Mohrside',
					country: 'TW',
					line1: '238 Theresa Inlet',
					line2: 'Apt. 372',
					postal_code: '24892',
					state: 'LA'
				},
				carrier: null,
				name: 'Adella Cummings',
				phone: '(089) 743-0609 x50793',
				tracking_number: null
			},
			source: {
				id: 'src_1CRRSx2eZvKYlo2CzUKiLVur',
				object: 'source',
				amount: null,
				card: {
					exp_month: 5,
					exp_year: 2020,
					address_line1_check: 'unchecked',
					address_zip_check: 'unchecked',
					brand: 'Visa',
					card_automatically_updated: false,
					country: 'US',
					fingerprint: 'Xt5EWLLDS7FJjR1c',
					funding: 'credit',
					last4: '4242',
					three_d_secure: 'optional',
					cvc_check: null,
					tokenization_method: null,
					dynamic_last4: null
				},
				client_secret: 'src_client_secret_Cr9m7mLIMTLEYanmw1pUGp3a',
				created: 1526245851,
				currency: 'usd',
				flow: 'none',
				livemode: false,
				metadata: {},
				owner: {
					address: {
						city: 'Hirtheview',
						country: 'US',
						line1: '473 Fay Roads',
						line2: 'Suite 505',
						postal_code: '34146',
						state: 'RI'
					},
					email: null,
					name: 'Mr. Beulah Morar',
					phone: null,
					verified_address: null,
					verified_email: null,
					verified_name: null,
					verified_phone: null
				},
				statement_descriptor: null,
				status: 'chargeable',
				type: 'card',
				usage: 'reusable'
			},
			source_transfer: null,
			statement_descriptor: 'SixCRM.com',
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

	response_type = (_.includes(['success','error'], response_type))?response_type:'success';

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
		error:{
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

function getValidCustomerTokenResponse({no_shipping = false} = {}){

	let shipping = {
		address: {
			city: 'New Iciemouth',
			country: 'VN',
			line1: '0720 Nelle Village',
			line2: 'Suite 274',
			postal_code: '93081-4464',
			state: 'UT'
		},
		name: 'Catalina Cartwright',
		phone: '784.629.3188 x67672'
	};

	return {
		id: 'cus_Cr9tqY83W2v98i',
	  object: 'customer',
	  account_balance: 0,
	  created: 1526246261,
	  currency: null,
	  default_source: 'src_1CRRZY2eZvKYlo2CYXdzNnZq',
	  delinquent: false,
	  description: null,
	  discount: null,
	  email: 'Catalina.Cartwright@darryl.name',
	  invoice_prefix: '866EE5F',
	  livemode: false,
	  metadata: {},
	  shipping:(no_shipping == true)?null:{ address:
	      { city: 'New Iciemouth',
	        country: 'VN',
	        line1: '0720 Nelle Village',
	        line2: 'Suite 274',
	        postal_code: '93081-4464',
	        state: 'UT' },
	     name: 'Catalina Cartwright',
	     phone: '784.629.3188 x67672' },
	  sources:
	   { object: 'list',
	     data:
	      [ { id: 'src_1CRRZY2eZvKYlo2CYXdzNnZq',
	          object: 'source',
	          amount: null,
	          card:
	           { exp_month: 9,
	             exp_year: 2020,
	             address_line1_check: 'unchecked',
	             address_zip_check: 'unchecked',
	             brand: 'Visa',
	             card_automatically_updated: false,
	             country: 'US',
	             fingerprint: 'Xt5EWLLDS7FJjR1c',
	             funding: 'credit',
	             last4: '4242',
	             three_d_secure: 'optional',
	             cvc_check: null,
	             tokenization_method: null,
	             dynamic_last4: null },
	          client_secret: 'src_client_secret_Cr9tlAFYXu5ojt9GwBmArtBp',
	          created: 1526246260,
	          currency: 'usd',
	          customer: 'cus_Cr9tqY83W2v98i',
	          flow: 'none',
	          livemode: false,
	          metadata: {},
	          owner:
	           { address:
	              { city: 'Sengerland',
	                country: 'US',
	                line1: '63163 Amalia Views',
	                line2: 'Suite 985',
	                postal_code: '96482-2190',
	                state: 'NM' },
	             email: null,
	             name: 'Athena Ratke',
	             phone: null,
	             verified_address: null,
	             verified_email: null,
	             verified_name: null,
	             verified_phone: null },
	          statement_descriptor: null,
	          status: 'chargeable',
	          type: 'card',
	          usage: 'reusable' } ],
	     has_more: false,
	     total_count: 1,
	     url: '/v1/customers/cus_Cr9tqY83W2v98i/sources' },
	  subscriptions:
	   { object: 'list',
	     data: [],
	     has_more: false,
	     total_count: 0,
	     url: '/v1/customers/cus_Cr9tqY83W2v98i/subscriptions' } };

}

describe('vendors/merchantproviders/Stripe.js', () => {

	beforeEach(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
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
			let response = getValidListChargesResponse('error');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');

			});

		});

		it('successfully returns a success', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let response = getValidListChargesResponse('success');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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

		it('successfully processes a transaction (new customer, existing card)', () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'

			let amount = 2.00;

			let charge_response = getValidCreateChargeResponse('success');
			let source_response = getValidSourceResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = customer_response.id
			let creditcard_tag = MockEntities.getValidTag();
			creditcard_tag.key = 'stripe_token';
			creditcard_tag.value = source_response.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					if(key == 'customer_'+customer.id+'_stripe_source_token'){
						//Note:  Customer is new, can't have a tag.
						return Promise.resolve(null);
					}
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					let tag = MockEntities.getValidTag();
					tag.entity = entity.entity;
					tag.key = entity.key;
					tag.value = entity.value;
					return Promise.resolve(tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID({id}){
					expect(id).to.be.defined;
					if(_.has(id, 'id')){
						return id.id;
					}
					return id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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
				getSource(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('src_');
					return Promise.resolve(source_response);
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 404;
					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});
				}
				createCustomer(token){
					expect(token).to.be.a('object');
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

		it('successfully processes a transaction (existing customer, existing card)', () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'

			let amount = 2.00;

			let charge_response = getValidCreateChargeResponse('success');
			let source_response = getValidSourceResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = customer_response.id

			let creditcard_tag = MockEntities.getValidTag();
			creditcard_tag.key = 'customer_'+customer.id+'_stripe_source_token';
			creditcard_tag.value = source_response.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					if(key == 'customer_'+customer.id+'_stripe_source_token'){
						return Promise.resolve(creditcard_tag);
					}
					if(id.id == customer.id && key == 'stripe_token'){
						return Promise.resolve(customer_tag);
					}
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					let tag = MockEntities.getValidTag();
					tag.entity = entity.entity;
					tag.key = entity.key;
					tag.value = entity.value;
					return Promise.resolve(tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID({id}){
					expect(id).to.be.defined;
					if(_.has(id, 'id')){
						return id.id;
					}
					return id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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
				getSource(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('src_');
					return Promise.resolve(source_response);
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 404;
					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});
				}
				createCustomer(token){
					expect(token).to.be.a('object');
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

		it('successfully declines a transaction (existing customer, new card)', () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let creditcard = getValidCreditCard();
			creditcard.number = '4000000000000002';

			let amount = 2.00;

			let charge_response = getValidCreateChargeResponse('decline');
			let source_response = getValidSourceResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = customer_response.id

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.defined;
					expect(key).to.be.a('string');
					if(id.id == customer.id && key == 'stripe_token'){
						return Promise.resolve(customer_tag);
					}
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					let tag = MockEntities.getValidTag();
					tag.entity = entity.entity;
					tag.key = entity.key;
					tag.value = entity.value;
					return Promise.resolve(tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID({id}){
					expect(id).to.be.defined;
					if(_.has(id, 'id')){
						return id.id;
					}
					return id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCharge(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: charge_response,
						response: {
							statusCode: 402,
							statusMessage:'Request Failed',
							body: charge_response
						},
						body: null
					});
				}
				getSource(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('src_');
					return Promise.resolve(source_response);
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(charge_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 404;
					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});
				}
				createCustomer(token){
					expect(token).to.be.a('object');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.process({customer: customer, creditcard: creditcard, amount: amount}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('decline');
				expect(result.getResult().message).to.equal('Declined');
			});

		});

		it('successfully processes a transaction (new customer, new card)', () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'

			let amount = 2.00;

			let charge_response = getValidCreateChargeResponse('success');
			let source_response = getValidSourceResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = customer_response.id
			let creditcard_tag = MockEntities.getValidTag();
			creditcard_tag.key = 'stripe_token';
			creditcard_tag.value = source_response.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					let tag = MockEntities.getValidTag();
					tag.entity = entity.entity;
					tag.key = entity.key;
					tag.value = entity.value;
					return Promise.resolve(tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID({id}){
					expect(id).to.be.defined;
					if(_.has(id, 'id')){
						return id.id;
					}
					return id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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
				getSource(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('src_');
					let error = new Error();
					error.statusCode = 404;
					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 404;
					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});
				}
				createCustomer(token){
					expect(token).to.be.a('object');
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

		it('successfully declines a transaction (new customer, new card)', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();
			let creditcard = getValidCreditCard();

			creditcard.number = '4000000000000002';
			let amount = 30.00;

			let charge_response = getValidCreateChargeResponse('decline');
			let source_response = getValidSourceResponse({});
			let customer_response = getValidCustomerTokenResponse({});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					return Promise.resolve(null);
				}
				create({entity}){
					expect(entity).to.be.a('object');
					let tag = MockEntities.getValidTag();
					tag.entity = entity.entity;
					tag.key = entity.key;
					tag.value = entity.value;
					return Promise.resolve(tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID({id}){
					expect(id).to.be.defined;
					if(_.has(id, 'id')){
						return id.id;
					}
					return id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCharge(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: charge_response,
						response: {
							statusCode: 402,
							statusMessage:'Request Failed',
							body: charge_response
						},
						body: null
					});
				}
				getSource(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('src_');
					return Promise.resolve(source_response);
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(customer_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('cus_');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			return stripeController.process({customer: customer, creditcard: creditcard, amount: amount}).then(result => {
				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('decline');
				expect(result.getResult().message).to.equal('Declined');
			});

		});

	});

	describe('refund', () => {

		it('successfully fails to refund a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let refund_response = getValidCreateRefundsResponse('error');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');
			});

		});

		it('successfully refunds a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let refund_response = getValidCreateRefundsResponse('success');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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

			let reverse_response = getValidCreateRefundsResponse('error', 'reverse');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');
			});

		});

		it('successfully refunds a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
			let transaction = getValidTransaction();

			transaction.processor_response = {result: getValidCreateChargeResponse('success')};

			let refund_response = getValidCreateRefundsResponse('success','reverse');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
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

			let source_response = getValidSourceResponse({});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('src_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('source');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token).to.have.property('owner');
			expect(creditcard_token.owner).to.have.property('name');
			expect(creditcard_token.owner.name).is.a('string');
			expect(creditcard_token.owner).to.have.property('address');
			expect(creditcard_token.owner.address).to.have.property('line1');
			expect(creditcard_token.owner.address.line1).is.a('string');
			expect(creditcard_token.owner.address).to.have.property('city');
			expect(creditcard_token.owner.address.city).is.a('string');
			expect(creditcard_token.owner.address.state).is.a('string');
			expect(creditcard_token.owner.address.country).is.a('string');
			expect(creditcard_token.owner.address.postal_code).is.a('string');


		});

		it('successfully creates a card token when shipping address information is not present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'
			delete creditcard.address;

			let source_response = getValidSourceResponse({no_address: true});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCreditCard(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(token_response);
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);

			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('src_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('source');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token).to.have.property('owner');
			expect(creditcard_token.owner).to.have.property('name');
			expect(creditcard_token.owner.name).is.a('string');
			expect(creditcard_token.owner).to.have.property('address');
			expect(creditcard_token.owner.address).to.equal(null);

		});

		it('successfully creates a card token when shipping address information is not present and name is not present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'
			delete creditcard.address;
			delete creditcard.name;

			let source_response = getValidSourceResponse({no_address: true, no_name: true});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('src_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('source');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token).to.have.property('owner');
			expect(creditcard_token.owner).to.have.property('name');
			expect(creditcard_token.owner.name).to.equal(null);
			expect(creditcard_token.owner).to.have.property('address');
			expect(creditcard_token.owner.address).to.equal(null);

		});

		it('successfully creates a card token when name is not present', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242'
			delete creditcard.name;

			let source_response = getValidSourceResponse({no_name: true});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let creditcard_token = await stripeController._createCardToken(creditcard);
			expect(creditcard_token).to.have.property('id');
			expect(creditcard_token.id).to.have.string('src_');
			expect(creditcard_token).to.have.property('object');
			expect(creditcard_token.object).to.equal('source');
			expect(creditcard_token).to.have.property('card');
			expect(creditcard_token).to.have.property('owner');
			expect(creditcard_token.owner).to.have.property('name');
			expect(creditcard_token.owner.name).to.equal(null);
			expect(creditcard_token.owner).to.have.property('address');
			expect(creditcard_token.owner.address).to.have.property('line1');
			expect(creditcard_token.owner.address.line1).is.a('string');
			expect(creditcard_token.owner.address).to.have.property('city');
			expect(creditcard_token.owner.address.city).is.a('string');
			expect(creditcard_token.owner.address.state).is.a('string');
			expect(creditcard_token.owner.address.country).is.a('string');
			expect(creditcard_token.owner.address.postal_code).is.a('string');

		});

	});

	describe('_createCustomer', async () => {

		it('successfully creates a customer', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer = getValidCustomer();

			let source_response = getValidSourceResponse({no_name: true});

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

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let customer_token = await stripeController._createCustomer({customer: customer, stripe_source: source_response});
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

			let source_response = getValidSourceResponse({no_name: true});

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

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let customer_token = await stripeController._createCustomer({customer: customer, stripe_source: source_response});
			expect(customer_token).to.have.property('id');
			expect(customer_token).to.have.property('object');
			expect(customer_token.id).to.have.string('cus_');
			expect(customer_token.object).to.equal('customer');
			expect(customer_token).to.have.property('shipping');
			expect(customer_token.shipping).to.be.a('null');

		});

	});

	describe('retrieveCustomer', async () => {

		it('successfully retrieves stripe customer from a token', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer_response = getValidCustomerTokenResponse({});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				getCustomer(token){
					expect(token).to.be.a('string');
					return Promise.resolve(customer_response);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._retrieveCustomer(customer_response.id);
			expect(result).to.have.property('id');
			expect(result).to.have.property('object');
			expect(result.id).to.have.string('cus_');
			expect(result.object).to.equal('customer');

		});

		it('fails to identify a customer from a token', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer_response = getValidCustomerTokenResponse({});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 404;

					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});

				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._retrieveCustomer(customer_response.id);
			expect(result).to.equal(null);

		});

		it('throws non-404 errors', async () => {

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			let customer_response = getValidCustomerTokenResponse({});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 403;

					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});

				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			try{
				let result = await stripeController._retrieveCustomer(customer_response.id);
			}catch(error){
				expect(error.statusCode).to.equal(403);
			}

		});

	});

	describe('createCustomerParameters', async () => {

		it('creates a customer', async () => {

			let customer = {
				id: '0fb8cc2c-f525-48ff-9341-a447746c3776',
			  account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			  email: 'test@test.com',
			  firstname: 'TestFirst',
			  lastname: 'TestLast',
			  phone: '1-030-415-4909',
			  address:
			   { line1: '123 Mountainman Ct.',
			     city: 'Yostside',
			     state: 'TN',
			     zip: '99831',
			     country: 'GD',
			     line2: 'Apt. 647' },
			  creditcards: [ 'fe9422d1-509e-49fa-8bd3-8d973d981697' ],
			  created_at: '2018-05-13T16:46:26.013Z',
			  updated_at: '2018-05-13T16:46:26.014Z'
			};

			customer.email = 'test@test.com';
			let stripe_source = getValidSourceResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = stripeController._createCustomerParameters({customer: customer, stripe_source: stripe_source});
			expect(result.email).to.equal(customer.email);
			expect(result.source).to.equal(stripe_source.id);
			expect(result).to.have.property('shipping');
			expect(result.shipping).to.have.property('name');
			expect(result.shipping.name).to.equal(customer.firstname+' '+customer.lastname);
			expect(result.shipping).to.have.property('address');
			expect(result.shipping.address.line1).to.equal(customer.address.line1);
			expect(result.shipping.address.line2).to.equal(customer.address.line2);
			expect(result.shipping.address.city).to.equal(customer.address.city);
			expect(result.shipping.address.state).to.equal(customer.address.state);
			expect(result.shipping.address.postal_code).to.equal(customer.address.zip);
			expect(result.shipping.address.country).to.equal(customer.address.country);
			expect(result.shipping.phone).to.equal(customer.phone);

		});

		it('creates a customer (no shipping, no name)', async () => {

			let customer = {
				id: '0fb8cc2c-f525-48ff-9341-a447746c3776',
			  account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			  email: 'test@test.com',
			  phone: '1-030-415-4909',
			  address:
			   { line1: '123 Mountainman Ct.',
			     city: 'Yostside',
			     state: 'TN',
			     zip: '99831',
			     country: 'GD',
			     line2: 'Apt. 647' },
			  creditcards: [ 'fe9422d1-509e-49fa-8bd3-8d973d981697' ],
			  created_at: '2018-05-13T16:46:26.013Z',
			  updated_at: '2018-05-13T16:46:26.014Z'
			};

			customer.email = 'test@test.com';
			let stripe_source = getValidSourceResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = stripeController._createCustomerParameters({customer: customer, stripe_source: stripe_source});
			expect(result.email).to.equal(customer.email);
			expect(result.source).to.equal(stripe_source.id);
			expect(result.shipping).to.not.be.defined;

		});

		it('creates a customer (no shipping, missing address)', async () => {

			let customer = {
				id: '0fb8cc2c-f525-48ff-9341-a447746c3776',
			  account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			  email: 'test@test.com',
			  firstname: 'TestFirst',
			  lastname: 'TestLast',
			  phone: '1-030-415-4909',
			  creditcards: [ 'fe9422d1-509e-49fa-8bd3-8d973d981697' ],
			  created_at: '2018-05-13T16:46:26.013Z',
			  updated_at: '2018-05-13T16:46:26.014Z'
			};

			customer.email = 'test@test.com';
			let stripe_source = getValidSourceResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = stripeController._createCustomerParameters({customer: customer, stripe_source: stripe_source});
			expect(result.email).to.equal(customer.email);
			expect(result.source).to.equal(stripe_source.id);
			expect(result.shipping).to.not.be.defined;

		});

		it('creates a customer (no shipping, missing required fields)', async () => {

			let customer = {
				id: '0fb8cc2c-f525-48ff-9341-a447746c3776',
			  account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			  email: 'test@test.com',
			  firstname: 'TestFirst',
			  lastname: 'TestLast',
			  phone: '1-030-415-4909',
			  address:
			   { line1: '123 Mountainman Ct.',
			     state: 'TN',
			     zip: '99831',
			     country: 'GD',
			     line2: 'Apt. 647' },
			  creditcards: [ 'fe9422d1-509e-49fa-8bd3-8d973d981697' ],
			  created_at: '2018-05-13T16:46:26.013Z',
			  updated_at: '2018-05-13T16:46:26.014Z'
			};

			customer.email = 'test@test.com';
			let stripe_source = getValidSourceResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = stripeController._createCustomerParameters({customer: customer, stripe_source: stripe_source});
			expect(result.email).to.equal(customer.email);
			expect(result.source).to.equal(stripe_source.id);
			expect(result.shipping).to.not.be.defined;

		});

	});

	//Technical Debt:  Card already used error?
	//Technical Debt:  Card not found error?
	describe('createCustomer', async () => {

		it('successfully creates a customer', async () => {

			let stripe_source = getValidSourceResponse({});
			let customer = getValidCustomer();
			let stripe_customer = getValidCustomerTokenResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(stripe_customer);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tag/Tag.js'), class {
				constructor(){}
				putTag({entity, key, value}){
					expect(entity).to.be.a('object');
					expect(key).to.be.a('string');
					expect(value).to.be.a('string');
					return Promise.resolve({});
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._createCustomer({customer: customer, stripe_source: stripe_source});
			expect(result).to.have.property('id');
			expect(result).to.have.property('object');
			expect(result.id).to.have.string('cus_');
			expect(result.object).to.equal('customer');

		});

	});

	describe('Get Card Token', async () => {

		it('gets card token when no token has been stored', async() => {

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242';

			let customer = getValidCustomer();

			let stripe_source = getValidSourceResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tag/Tag.js'), class {
				constructor(){}
				putTag({entity, key, value}){
					expect(entity).to.be.a('object');
					expect(key).to.be.a('string');
					expect(value).to.be.a('string');
					return Promise.resolve({});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.a('object');
					expect(key).to.be.a('string');
					return Promise.resolve(null);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(stripe_source);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._getCardToken({creditcard:creditcard, customer: customer});
			expect(result).to.have.property('id');
			expect(result).to.have.property('object');
			expect(result.id).to.have.string('src_');
			expect(result.object).to.equal('source');
		});

		//Technical Debt:  tag exists but token does not
		it('gets card token when token tag has been stored', async() => {

			let customer = getValidCustomer();

			let creditcard = getValidCreditCard();
			creditcard.number = '4242424242424242';

			let stripe_source = getValidSourceResponse({});

			let tag = MockEntities.getValidTag();
			tag.entity = creditcard.id;
			tag.key = 'stripe_token';
			tag.value = stripe_source.id;

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tag/Tag.js'), class {
				constructor(){}
				putTag({entity, key, value}){
					expect(entity).to.be.a('object');
					expect(key).to.be.a('string');
					expect(value).to.be.a('string');
					expect('key').to.equal('stripe_token');
					return Promise.resolve(tag);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.a('object');
					expect(key).to.be.a('string');
					expect(key).to.equal('customer_'+customer.id+'_stripe_source_token');
					return Promise.resolve(tag);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				getSource(token){
					expect(token).to.be.a('string');
					return Promise.resolve(stripe_source);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._getCardToken({creditcard: creditcard, customer: customer});
			expect(result).to.have.property('id');
			expect(result).to.have.property('object');
			expect(result.id).to.have.string('src_');
			expect(result.object).to.equal('source');

		});

	});

	describe('getCustomer', async () => {
		it('successfully gets customer (tag exists)', async () => {

			let customer = getValidCustomer();
			let stripe_customer = getValidCustomerTokenResponse({});
			let stripe_source = getValidSourceResponse({});

			let tag = MockEntities.getValidTag();
			tag.entity = customer.id;
			tag.key = 'stripe_token';
			tag.value = stripe_customer.id;

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.a('object');
					expect(key).to.be.a('string');
					expect(key).to.equal('stripe_token');
					return Promise.resolve(tag);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tag/Tag.js'), class {
				constructor(){}
				putTag({entity, key, value}){
					expect(entity).to.be.a('object');
					expect(key).to.be.a('string');
					expect(value).to.be.a('string');
					expect('key').to.equal('stripe_token');
					return Promise.resolve({entity: entity.id, key: 'stripe_token', value: value});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				getCustomer(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('cus_');
					return Promise.resolve(stripe_customer);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._getCustomer({customer: customer, stripe_source: stripe_source});
			expect(result).to.have.property('id');
			expect(result).to.have.property('object');
			expect(result.id).to.have.string('cus_');
			expect(result.object).to.equal('customer');

		});

		//Technical Debt:  You can not use a token more than once
		it('successfully gets customer (tag does not exist)', async () => {

			let customer = getValidCustomer();
			let stripe_customer = getValidCustomerTokenResponse({});
			let stripe_source = getValidSourceResponse({});

			let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
					expect(id).to.be.a('object');
					expect(key).to.be.a('string');
					expect(key).to.equal('stripe_token');
					return Promise.resolve(null);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tag/Tag.js'), class {
				constructor(){}
				putTag({entity, key, value}){
					expect(entity).to.be.a('object');
					expect(key).to.be.a('string');
					expect(value).to.be.a('string');
					expect(key).to.equal('stripe_token');
					return Promise.resolve({entity: entity.id, key: 'stripe_token', value: value});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/Stripe/api.js'), class {
				constructor(){}
				createCustomer(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(stripe_customer);
				}
			});

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController._getCustomer({customer: customer, stripe_source: stripe_source});
			expect(result).to.have.property('id');
			expect(result).to.have.property('object');
			expect(result.id).to.have.string('cus_');
			expect(result.object).to.equal('customer');

		});
	});

	/*
	async _getCustomer({customer, stripe_creditcard}){

		du.debug('getStripeCustomerRecord');

		let customerHelperController = new CustomerHelperController();
		let customer_stripe_token = await customerHelperController.getTag(customer, 'stripe_token');

		let stripe_customer_record = null;

		if(!_.isNull(customer_stripe_token)){
			stripe_customer_record = await this._retrieveCustomer(customer_stripe_token);
		}

		if(_.isNull(stripe_customer_record)){
			stripe_customer_record = await this._createCustomer({customer, stripe_creditcard});
		}

		return stripe_customer_record;

	}
	*/

});
