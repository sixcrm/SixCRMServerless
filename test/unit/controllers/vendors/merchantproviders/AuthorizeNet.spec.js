const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe.only('vendors/merchantproviders/AuthorizeNet/handler.js', () => {
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
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});
			expect(objectutilities.getClassName(authorizeNetController)).to.equal('AuthorizeNetController');
		});

	});

	describe('process', () => {
		it('charges new customer & new creditcard successfully', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const customer = MockEntities.getValidCustomer();
			const creditcard = MockEntities.getValidCreditCard();
			const amount = 1.00;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js'), class {
				getCustomerProfile(_customer) {
					expect(_customer).to.equal(customer);
					const error = new Error('The record cannot be found.');
					error.code = 'E00040';
					return Promise.reject(error);
				}
				createCustomerProfile(_customer, creditcards) {
					expect(_customer).to.equal(customer);
					expect(creditcards).to.deep.equal([creditcard]);
					return Promise.resolve({
						customerProfileId: '123',
						customerPaymentProfileIdList: [
							'234'
						]
					});
				}
				chargePaymentProfile({customer_profile_id, payment_profile_id, amount: _amount}) {
					expect(customer_profile_id).to.equal('123');
					expect(payment_profile_id).to.equal('234');
					expect(_amount).to.equal(amount);
					const charge_response = {
						transactionResponse: {
							responseCode: '1',
							authCode: 'IK5WPJ',
							avsResultCode: 'Y',
							cvvResultCode: 'P',
							cavvResultCode: '2',
							transId: '60104292907',
							refTransID: '',
							transHash: 'DDBCFC9CFF541E81EF11F5E0CD917DB2',
							testRequest: '0',
							accountNumber: 'XXXX1111',
							accountType: 'Visa',
							messages: [{
								code: '1',
								description: 'This transaction has been approved.'
							}],
							transHashSha2: '',
							profile: {
								customerProfileId: '123',
								customerPaymentProfileId: '234'
							}
						},
						messages: {
							resultCode: 'Ok',
							message: [{
								code: 'I00001',
								text: 'Successful.'
							}]
						}
					};
					return Promise.resolve({
						error: null,
						body: charge_response,
						response: {
							statusCode: 200,
							body: charge_response
						}
					});
				}
			});

			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});

			const result = await authorizeNetController.process({customer, creditcard, amount});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});

		it('charges existing customer with new creditcard successfully', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const customer = MockEntities.getValidCustomer();
			const creditcard = MockEntities.getValidCreditCard();
			creditcard.first_six = '411111';
			creditcard.last_four = '1111';
			creditcard.expiration = '10/2025';
			const amount = 1.00;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js'), class {
				getCustomerProfile(_customer) {
					expect(_customer).to.equal(customer);
					return Promise.resolve({
						customerProfileId: '123',
						paymentProfiles: []
					});
				}
				createPaymentProfile(customer_profile_id, _customer, _creditcard) {
					expect(customer_profile_id).to.equal('123');
					expect(_customer).to.equal(customer);
					expect(_creditcard).to.equal(creditcard);
					return Promise.resolve({
						customerProfileId: '123',
					  customerPaymentProfileId: '234'
					});
				}
				chargePaymentProfile({customer_profile_id, payment_profile_id, amount: _amount}) {
					expect(customer_profile_id).to.equal('123');
					expect(payment_profile_id).to.equal('234');
					expect(_amount).to.equal(amount);
					const charge_response = {
						transactionResponse: {
							responseCode: '1',
							authCode: 'IK5WPJ',
							avsResultCode: 'Y',
							cvvResultCode: 'P',
							cavvResultCode: '2',
							transId: '60104292907',
							refTransID: '',
							transHash: 'DDBCFC9CFF541E81EF11F5E0CD917DB2',
							testRequest: '0',
							accountNumber: 'XXXX1111',
							accountType: 'Visa',
							messages: [{
								code: '1',
								description: 'This transaction has been approved.'
							}],
							transHashSha2: '',
							profile: {
								customerProfileId: '123',
								customerPaymentProfileId: '234'
							}
						},
						messages: {
							resultCode: 'Ok',
							message: [{
								code: 'I00001',
								text: 'Successful.'
							}]
						}
					};
					return Promise.resolve({
						error: null,
						body: charge_response,
						response: {
							statusCode: 200,
							body: charge_response
						}
					});
				}
			});

			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});

			const result = await authorizeNetController.process({customer, creditcard, amount});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});

		it('charges existing customer with existing creditcard successfully', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const customer = MockEntities.getValidCustomer();
			const creditcard = MockEntities.getValidCreditCard();
			creditcard.first_six = '411111';
			creditcard.last_four = '1111';
			creditcard.expiration = '10/2025';
			const amount = 1.00;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js'), class {
				getCustomerProfile(_customer) {
					expect(_customer).to.equal(customer);
					return Promise.resolve({
						customerProfileId: '123',
						paymentProfiles: [{
							customerPaymentProfileId: '456',
							payment: {
								creditCard: {
									cardNumber: 'XXXX4242',
									expirationDate: '2025-10',
									cardType: 'Visa',
									issuerNumber: '424242'
								}
							}
						},
						{
							customerPaymentProfileId: '234',
							payment: {
								creditCard: {
									cardNumber: 'XXXX1111',
									expirationDate: '2025-10',
									cardType: 'Visa',
									issuerNumber: '411111'
								}
							}
						}]
					});
				}
				chargePaymentProfile({customer_profile_id, payment_profile_id, amount: _amount}) {
					expect(customer_profile_id).to.equal('123');
					expect(payment_profile_id).to.equal('234');
					expect(_amount).to.equal(amount);
					const charge_response = {
						transactionResponse: {
							responseCode: '1',
							authCode: 'IK5WPJ',
							avsResultCode: 'Y',
							cvvResultCode: 'P',
							cavvResultCode: '2',
							transId: '60104292907',
							refTransID: '',
							transHash: 'DDBCFC9CFF541E81EF11F5E0CD917DB2',
							testRequest: '0',
							accountNumber: 'XXXX1111',
							accountType: 'Visa',
							messages: [{
								code: '1',
								description: 'This transaction has been approved.'
							}],
							transHashSha2: '',
							profile: {
								customerProfileId: '123',
								customerPaymentProfileId: '234'
							}
						},
						messages: {
							resultCode: 'Ok',
							message: [{
								code: 'I00001',
								text: 'Successful.'
							}]
						}
					};
					return Promise.resolve({
						error: null,
						body: charge_response,
						response: {
							statusCode: 200,
							body: charge_response
						}
					});
				}
			});

			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});

			const result = await authorizeNetController.process({customer, creditcard, amount});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});

		it('card is declined', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const customer = MockEntities.getValidCustomer();
			const creditcard = MockEntities.getValidCreditCard();
			creditcard.first_six = '411111';
			creditcard.last_four = '1111';
			creditcard.expiration = '10/2025';
			const amount = 1.00;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js'), class {
				getCustomerProfile(_customer) {
					expect(_customer).to.equal(customer);
					return Promise.resolve({
						customerProfileId: '123',
						paymentProfiles: [{
							customerPaymentProfileId: '456',
							payment: {
								creditCard: {
									cardNumber: 'XXXX4242',
									expirationDate: '2025-10',
									cardType: 'Visa',
									issuerNumber: '424242'
								}
							}
						},
						{
							customerPaymentProfileId: '234',
							payment: {
								creditCard: {
									cardNumber: 'XXXX1111',
									expirationDate: '2025-10',
									cardType: 'Visa',
									issuerNumber: '411111'
								}
							}
						}]
					});
				}
				chargePaymentProfile({customer_profile_id, payment_profile_id, amount: _amount}) {
					expect(customer_profile_id).to.equal('123');
					expect(payment_profile_id).to.equal('234');
					expect(_amount).to.equal(amount);
					const charge_response = {
						transactionResponse: {
							responseCode: '2',
							authCode: 'IK5WPJ',
							avsResultCode: 'Y',
							cvvResultCode: 'P',
							cavvResultCode: '2',
							transId: '60104292907',
							refTransID: '',
							transHash: 'DDBCFC9CFF541E81EF11F5E0CD917DB2',
							testRequest: '0',
							accountNumber: 'XXXX1111',
							accountType: 'Visa',
							messages: [{
								code: '2',
								description: 'This transaction has been declined.'
							}],
							transHashSha2: '',
							profile: {
								customerProfileId: '123',
								customerPaymentProfileId: '234'
							}
						},
						messages: {
							resultCode: 'Ok',
							message: [{
								code: 'I00001',
								text: 'Successful.'
							}]
						}
					};
					return {
						error: new Error('This transaction has been declined.'),
						body: charge_response,
						response: {
							statusCode: 400,
							body: charge_response
						}
					};
				}
			});

			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});

			const result = await authorizeNetController.process({customer, creditcard, amount});
			expect(result.getResult().code).to.equal('decline');
			expect(result.getResult().message).to.equal('Declined');
		});
	});

	describe('refund', () => {
		it('successfully refunds a transaction', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const transaction = MockEntities.getValidTransaction();
			transaction.processor_response = {
				transactionResponse: {
					transId: '123',
					accountNumber: '1111'
				}
			};
			const amount = 1.00;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js'), class {
				refundCreditCard({transaction_id, amount: _amount, last_four: last_four}) {
					expect(transaction_id).to.equal('123');
					expect(_amount).to.equal(amount);
					expect(last_four).to.equal('1111');
					const charge_response = {
						transactionResponse: {
							responseCode: '1',
							authCode: 'IK5WPJ',
							avsResultCode: 'Y',
							cvvResultCode: 'P',
							cavvResultCode: '2',
							transId: '234',
							refTransID: '123',
							transHash: 'DDBCFC9CFF541E81EF11F5E0CD917DB2',
							testRequest: '0',
							accountNumber: 'XXXX1111',
							accountType: 'Visa',
							messages: [{
								code: '1',
								description: 'This transaction has been approved.'
							}],
							transHashSha2: ''
						},
						messages: {
							resultCode: 'Ok',
							message: [{
								code: 'I00001',
								text: 'Successful.'
							}]
						}
					};
					return Promise.resolve({
						error: null,
						body: charge_response,
						response: {
							statusCode: 200,
							body: charge_response
						}
					});
				}
			});

			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});

			const result = await authorizeNetController.refund({transaction, amount});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});
	});

	describe('reverse', () => {
		it('successfully reverses a transaction', async () => {
			const merchant_provider = MockEntities.getValidMerchantProvider(null, 'AuthorizeNet');
			const transaction = MockEntities.getValidTransaction();
			transaction.processor_response = {
				transactionResponse: {
					transId: '123'
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/AuthorizeNet/api.js'), class {
				voidTransaction({transaction_id}) {
					expect(transaction_id).to.equal('123');
					const charge_response = {
						transactionResponse: {
							responseCode: '1',
							authCode: 'IK5WPJ',
							avsResultCode: 'Y',
							cvvResultCode: 'P',
							cavvResultCode: '2',
							transId: '234',
							refTransID: '123',
							transHash: 'DDBCFC9CFF541E81EF11F5E0CD917DB2',
							testRequest: '0',
							accountNumber: 'XXXX1111',
							accountType: 'Visa',
							messages: [{
								code: '1',
								description: 'This transaction has been approved.'
							}],
							transHashSha2: ''
						},
						messages: {
							resultCode: 'Ok',
							message: [{
								code: 'I00001',
								text: 'Successful.'
							}]
						}
					};
					return Promise.resolve({
						error: null,
						body: charge_response,
						response: {
							statusCode: 200,
							body: charge_response
						}
					});
				}
			});

			const AuthorizeNetController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/AuthorizeNet/handler.js');
			const authorizeNetController = new AuthorizeNetController({merchant_provider});

			const result = await authorizeNetController.reverse({transaction});
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');
		});
	});
});
