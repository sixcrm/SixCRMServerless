const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const _ = require('lodash');
const querystring = require('querystring');
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getSuccessResponse({transaction_id} = {}) {
	return querystring.stringify({
		PostedDate: '6/6/2018 3:39:13 PM',
	  StatusID: '0',
	  TransactionID: transaction_id || '1',
	  ReferenceNumber: '123',
	  TransactionAmount: '1.00',
	  AuthorizationCode: '944906',
	  ResponseCode: '00',
	  ResponseMessage: 'APPROVED',
	  CVV2ResponseCode: 'M',
	  CVV2ResponseMessage: 'CVV MATCH',
	  AVSResponseCode: 'Y',
	  AVSResponseMessage: 'ADDRESS AND ZIP MATCH',
	  URLPostback: '',
	  Table14Data: '',
	  CardNumber: '1111',
	  CustomerName: '',
	  BillingNameFirst: 'Rama',
	  BillingNameLast: 'Damunaste',
	  BillingAddress: '10 Downing St.',
	  BillingCity: 'London',
	  BillingState: 'OR',
	  BillingZipCode: '97213',
	  BillingCountry: 'US',
	  BillingPhone: '1234567890',
	  BillingFax: '',
	  BillingEmail: 'rama@damunaste.org',
	  CustomerID: '',
	  ProductDescription: '',
	  Action: '',
	  RedirectUrl: '',
	  ShippingAddress1: '',
	  ShippingAddress2: '',
	  ShippingCity: '',
	  ShippingState: '',
	  ShippingZipCode: '',
	  ShippingCountry: '',
	  CustomInfo1: '',
	  CustomInfo2: '',
	  CustomInfo3: '',
	  CustomInfo4: '',
	  CustomInfo5: '',
	  CustomInfo6: '',
	  CustomInfo7: '',
	  CustomInfo8: '',
	  CustomInfo9: '',
	  CustomInfo10: '',
	  CustomInfo11: '',
	  CustomInfo12: '',
	  CustomInfo13: '',
	  CustomInfo14: '',
	  CustomInfo15: '',
	  CustomInfo16: '',
	  CustomInfo17: '',
	  CustomInfo18: '',
	  CustomInfo19: '',
	  CustomInfo20: ''
	});
}

function getDeclineResponse() {
	return querystring.stringify({
		PostedDate: '6/6/2018 3:39:13 PM',
	  StatusID: '19',
	  TransactionID: '85341967',
	  ReferenceNumber: '123',
	  TransactionAmount: '1.00',
	  AuthorizationCode: '944906',
	  ResponseCode: '00',
	  ResponseMessage: 'DECLINED',
	  CVV2ResponseCode: 'M',
	  CVV2ResponseMessage: 'CVV MATCH',
	  AVSResponseCode: 'Y',
	  AVSResponseMessage: 'ADDRESS AND ZIP MATCH',
	  URLPostback: '',
	  Table14Data: '',
	  CardNumber: '1111',
	  CustomerName: '',
	  BillingNameFirst: 'Rama',
	  BillingNameLast: 'Damunaste',
	  BillingAddress: '10 Downing St.',
	  BillingCity: 'London',
	  BillingState: 'OR',
	  BillingZipCode: '97213',
	  BillingCountry: 'US',
	  BillingPhone: '1234567890',
	  BillingFax: '',
	  BillingEmail: 'rama@damunaste.org',
	  CustomerID: '',
	  ProductDescription: '',
	  Action: '',
	  RedirectUrl: '',
	  ShippingAddress1: '',
	  ShippingAddress2: '',
	  ShippingCity: '',
	  ShippingState: '',
	  ShippingZipCode: '',
	  ShippingCountry: '',
	  CustomInfo1: '',
	  CustomInfo2: '',
	  CustomInfo3: '',
	  CustomInfo4: '',
	  CustomInfo5: '',
	  CustomInfo6: '',
	  CustomInfo7: '',
	  CustomInfo8: '',
	  CustomInfo9: '',
	  CustomInfo10: '',
	  CustomInfo11: '',
	  CustomInfo12: '',
	  CustomInfo13: '',
	  CustomInfo14: '',
	  CustomInfo15: '',
	  CustomInfo16: '',
	  CustomInfo17: '',
	  CustomInfo18: '',
	  CustomInfo19: '',
	  CustomInfo20: ''
	});
}

describe('vendors/merchantproviders/PaymentXP/handler.js', () => {
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
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'PaymentXP');
			const PaymentXPController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/handler.js');
			const paymentXPController = new PaymentXPController({merchant_provider});
			expect(objectutilities.getClassName(paymentXPController)).to.equal('PaymentXPController');
		});

	});

	describe('process', () => {
		it('charges card successfully', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'PaymentXP');
			const customer = MockEntities.getValidCustomer();
			const creditcard = MockEntities.getValidCreditCard();
			const amount = 1.00;
			const response_body = getSuccessResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/PaymentXP/api.js'), class {
				creditcardCharge({creditcard: _creditcard, customer: _customer, amount: _amount}) {
					expect(_creditcard).to.equal(creditcard);
					expect(_customer).to.equal(customer);
					expect(_amount).to.equal(amount);
					return Promise.resolve({
						error: null,
						body: response_body,
						response: {
							statusCode: 200,
							body: response_body
						}
					});
				}
			});

			const PaymentXPController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/handler.js');
			const paymentXPController = new PaymentXPController({merchant_provider});

			const result = await paymentXPController.process({customer, creditcard, amount});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});

		it('card is declined', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'PaymentXP');
			const customer = MockEntities.getValidCustomer();
			const creditcard = MockEntities.getValidCreditCard();
			const amount = 1.00;
			const response_body = getDeclineResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/PaymentXP/api.js'), class {
				creditcardCharge({creditcard: _creditcard, customer: _customer, amount: _amount}) {
					expect(_creditcard).to.equal(creditcard);
					expect(_customer).to.equal(customer);
					expect(_amount).to.equal(amount);
					return Promise.resolve({
						error: null,
						body: response_body,
						response: {
							statusCode: 200,
							body: response_body
						}
					});
				}
			});

			const PaymentXPController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/handler.js');
			const paymentXPController = new PaymentXPController({merchant_provider});

			const result = await paymentXPController.process({customer, creditcard, amount});
			expect(result.getResult().code).to.equal('decline');
			expect(result.getResult().message).to.equal('Declined');
		});
	});

	describe('refund', () => {
		it('successfully refunds a transaction', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'PaymentXP');
			const transaction = MockEntities.getValidTransaction();
			const transaction_id = '123';
			transaction.processor_response = getSuccessResponse({transaction_id});
			const amount = 1.00;
			const response_body = getSuccessResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/PaymentXP/api.js'), class {
				creditcardCredit({transaction_id: _transaction_id, amount: _amount}) {
					expect(_transaction_id).to.equal(transaction_id);
					expect(_amount).to.equal(amount);
					return Promise.resolve({
						error: null,
						body: response_body,
						response: {
							statusCode: 200,
							body: response_body
						}
					});
				}
			});

			const PaymentXPController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/handler.js');
			const paymentXPController = new PaymentXPController({merchant_provider});

			const result = await paymentXPController.refund({transaction, amount});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});
	});

	describe('reverse', () => {
		it('successfully reverses a transaction', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'PaymentXP');
			const transaction = MockEntities.getValidTransaction();
			const transaction_id = '123';
			transaction.processor_response = getSuccessResponse({transaction_id});
			const response_body = getSuccessResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/PaymentXP/api.js'), class {
				creditcardVoid({transaction_id: _transaction_id}) {
					expect(_transaction_id).to.equal(transaction_id);
					return Promise.resolve({
						error: null,
						body: response_body,
						response: {
							statusCode: 200,
							body: response_body
						}
					});
				}
			});

			const PaymentXPController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/PaymentXP/handler.js');
			const paymentXPController = new PaymentXPController({merchant_provider});

			const result = await paymentXPController.reverse({transaction});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});
	});
});
