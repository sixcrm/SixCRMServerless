
const _ = require('lodash');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMerchantProvider(id) {
	return MockEntities.getValidMerchantProvider(id, 'NMI');
}

function getValidParametersObject(merchant_provider) {

	merchant_provider = (_.isUndefined(merchant_provider)) ? getValidMerchantProvider() : merchant_provider;

	return objectutilities.merge(
		merchant_provider.gateway, {
			endpoint: 'https://secure.networkmerchants.com/api/transact.php'
		}
	);
}

function getValidMethodParametersObject() {
	return {
		type: 'sale'
	};
}

function getValidReverseRequestParametersObject() {

	return {
		transaction: MockEntities.getValidTransaction()
	};

}

function getValidRefundRequestParametersObject() {

	return {
		transaction: MockEntities.getValidTransaction(),
		amount: 34.99
	};

}

function getValidRequestParametersObject() {

	return {
		amount: 100.00,
		count: 3,
		creditcard: {
			number: '5105105105105100',
			cvv: '123',
			expiration: '12/2014',
			address: {
				line1: '123 Main Street Apt. 1',
				city: 'Los Angeles',
				state: 'CA',
				zip: '90066',
				country: 'US'
			}
		},
		customer: {
			id: 'randomid',
			firstname: 'John',
			lastname: 'Doe',
			email: 'user5@example.com',
			address: {
				line1: '456 Another St.',
				line2: 'Apartment 2',
				city: 'Anaheim',
				state: 'CA',
				zip: '90067',
				country: 'US'
			}
		},
		session: {
			ip_address: '10.00.000.90',
		},
		transaction: {
			alias: 'ABC123'
		}
	};

}

/*function getMockResponse(){

  let mocked_callback = {
    response: '3',
    responsetext: 'Authentication Failed',
    authcode: '',
    transactionid: '0',
    avsresponse: '',
    cvvresponse: '',
    orderid: '',
    type: 'sale',
    response_code: '300'
  };

  return querystring.stringify(mocked_callback);

}*/

describe('vendors/merchantproviders/NMI.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('warmups', () => {

		it('Should fail due to missing properties', () => {

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

			try {

				new NMIController({});

			} catch (error) {

				expect(error.message).to.have.string('[500] Missing source object field: "merchant_provider".');

			}

		});

		it('Should Instantiate the NMI Controller', () => {

			let merchant_provider = getValidMerchantProvider();

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			expect(objectutilities.getClassName(nmi_controller)).to.equal('NMIController');

		});

		it('Should set vendor and merchant_provider parameters in request object', () => {

			let merchant_provider = getValidMerchantProvider();

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let parameters_object = nmi_controller.createParameterObject();

			const required_properties = {
				endpoint: 'https://secure.networkmerchants.com/api/transact.php',
				username: 'demo',
				password: 'password',
				processor_id: '0'
			};

			objectutilities.map(required_properties, (key) => {
				expect(parameters_object).to.have.property(key);
				if (key !== 'endpoint') {
					expect(parameters_object[key]).to.equal(merchant_provider.gateway[key]);
				} else {
					expect(parameters_object[key]).to.equal('https://secure.networkmerchants.com/api/transact.php');
				}
			});

		});

		it('Should set method parameters in request object', () => {

			let merchant_provider = getValidMerchantProvider();

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let parameters_object = getValidParametersObject(merchant_provider);
			let method_parameters = getValidMethodParametersObject();

			parameters_object = nmi_controller.setMethodParameters({
				return_parameters: parameters_object,
				method_parameters: method_parameters
			});

			const required_properties = {
				username: 'demo',
				password: 'password',
				processor_id: '0',
				endpoint: 'https://secure.networkmerchants.com/api/transact.php',
				type: 'sale'
			};

			objectutilities.map(required_properties, (key) => {
				expect(parameters_object).to.have.property(key);
				if (!_.includes(['endpoint', 'type'], key)) {
					expect(parameters_object[key]).to.equal(merchant_provider.gateway[key]);
				}
			});

		});

		it('Should set request parameters in request object', () => {

			let merchant_provider = getValidMerchantProvider();

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let parameters_object = getValidParametersObject(merchant_provider);
			let request_parameters = getValidRequestParametersObject();

			parameters_object = nmi_controller.setRequestParameters({
				type: 'process',
				request_parameters: request_parameters,
				return_parameters: parameters_object
			});

			const required_properties = {
				username: 'demo',
				password: 'password',
				processor_id: '0',
				endpoint: 'https://secure.networkmerchants.com/api/transact.php',
				amount: 100,
				ccnumber: '5105105105105100',
				cvv: '123',
				ccexp: '12/2014',
				firstname: 'John',
				lastname: 'Doe',
				address1: '123 Main Street Apt. 1',
				city: 'Los Angeles',
				state: 'CA',
				zip: '90066',
				country: 'US',
				shipping_address1: '456 Another St.',
				shipping_address2: 'Apartment 2',
				shipping_city: 'Anaheim',
				shipping_state: 'CA',
				shipping_zip: '90067',
				shipping_country: 'US'
			};

			objectutilities.map(required_properties, (key) => {
				expect(parameters_object).to.have.property(key);
				//expect(parameters_object[key]).to.equal(required_properties[key]);
			});

		});

		it('Should complete a "process" request', () => {

			let merchant_provider = getValidMerchantProvider();

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let parameters_object = getValidParametersObject();
			let method_parameters = getValidMethodParametersObject();
			let request_parameters = getValidRequestParametersObject();

			parameters_object = nmi_controller.setMethodParameters({
				method_parameters: method_parameters,
				return_parameters: parameters_object
			});

			parameters_object = nmi_controller.setRequestParameters({
				type: 'process',
				request_parameters: request_parameters,
				return_parameters: parameters_object
			});

			nmi_controller.validateRequestParameters('process', parameters_object);

			expect(true).to.equal(true);

		});

	});

	describe('process', () => {

		it('Should successfully process a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=1&responsetext=SUCCESS&authcode=123456&transactionid=3968694858&avsresponse=N&cvvresponse=&orderid=&type=sale&response_code=100';

			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let request_parameters = getValidRequestParametersObject();

			return nmi_controller.process(request_parameters).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

		it('handles declined transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=2&responsetext=DECLINE&authcode=&transactionid=3968711250&avsresponse=N&cvvresponse=&orderid=&type=sale&response_code=200';

			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let request_parameters = getValidRequestParametersObject();

			request_parameters.amount = 0.99;

			return nmi_controller.process(request_parameters).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('decline');
				expect(result.getResult().message).to.equal('Declined');

			});

		});

	});

	describe('reverse', () => {

		it('Should fail to reverse a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=3&responsetext=Transaction not found REFID:3505684946&authcode=&transactionid=3448894419&avsresponse=&cvvresponse=&orderid=&type=void&response_code=300';
			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let request_parameters = getValidReverseRequestParametersObject();

			request_parameters.transaction.processor_response = JSON.parse(request_parameters.transaction.processor_response);
			request_parameters.transaction.processor_response.result.response = { body: 'transactionid=1' };

			return nmi_controller.reverse(request_parameters).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');

			});

		});

		it('Should successfully reverse a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=1';
			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let request_parameters = getValidReverseRequestParametersObject();

			request_parameters.transaction.processor_response = JSON.parse(request_parameters.transaction.processor_response);
			request_parameters.transaction.processor_response.result.response = { body: 'transactionid=1' };

			return nmi_controller.reverse(request_parameters).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

	});

	describe('refund', () => {

		it('Should fail to refund a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=3&responsetext=Transaction not found REFID:3505684783&authcode=&transactionid=&avsresponse=&cvvresponse=&orderid=&type=refund&response_code=300'
			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let request_parameters = getValidRefundRequestParametersObject();

			request_parameters.transaction.processor_response = JSON.parse(request_parameters.transaction.processor_response);
			request_parameters.transaction.processor_response.result.response = { body: 'transactionid=1' };

			return nmi_controller.refund(request_parameters).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');

			});

		});

		it('Should successfully refund a transaction', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=1'
			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			let request_parameters = getValidRefundRequestParametersObject();

			request_parameters.transaction.processor_response = JSON.parse(request_parameters.transaction.processor_response);
			request_parameters.transaction.processor_response.result.response = { body: 'transactionid=1' };

			return nmi_controller.refund(request_parameters).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

	});

	describe('test', () => {

		it('validates', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=3&responsetext=The ccnumber field is required REFID:3505686505&authcode=&transactionid=&avsresponse=&cvvresponse=&orderid=&type=validate&response_code=300';

			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			return nmi_controller.test({}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

		it('fails to validate', () => {

			let merchant_provider = getValidMerchantProvider();

			let body = 'response=3&responsetext=Authentication Failed&authcode=&transactionid=0&avsresponse=&cvvresponse=&orderid=&type=validate&response_code=300'

			let response = {
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/lib/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');
			let nmi_controller = new NMIController({
				merchant_provider: merchant_provider
			});

			return nmi_controller.test({}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');

			});

		});

	});

});
