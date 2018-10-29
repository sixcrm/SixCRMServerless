

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let querystring = require('querystring');
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMerchantProvider(id){

	return MockEntities.getValidMerchantProvider(id, 'Test');

}

function getValidParametersObject(){
	return objectutilities.merge(
		getValidMerchantProvider().gateway,
		{
			endpoint: 'https://testmerchantprovider.sixcrm.com/'
		}
	);
}

function getValidMethodParametersObject(){
	return {
		path:'authorize'
	};
}

function getValidReverseRequestParametersObject(){

	return {
		transaction: MockEntities.getValidTransaction()
	};

}

function getValidRefundRequestParametersObject(){

	return {
		transaction: MockEntities.getValidTransaction(),
		amount: 34.99
	};

}

function getValidRequestParametersObject(){

	return {
		amount: 100.00,
		count: 3,
		creditcard: MockEntities.getValidPlaintextCreditCard(),
		customer: MockEntities.getValidCustomer()
	};

}

function getMockResponse(){

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

}

describe('vendors/merchantproviders/Test.js', () => {

	before(() => {
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

	after(() => {
		mockery.disable();
	});

	it('Should fail due to missing properties', () => {

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

		try {

			new TestController({});

		}catch(error){

			expect(error.message).to.have.string('[500] Missing source object field: "merchant_provider".');

		}

	});

	it('Should Instantiate the Test Controller', () => {

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

		let test_controller = new TestController({merchant_provider: merchant_provider});

		expect(test_controller.constructor.name).to.equal('TestController');

	});

	it('Should set vendor and merchant_provider parameters in request object', () => {

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');
		let test_controller = new TestController({merchant_provider: merchant_provider});

		let parameters_object = test_controller.createParameterObject();

		const required_properties = {
			username: 'demo',
			password: 'password',
			processor_id: '0'
		};

		objectutilities.map(required_properties, (key) => {
			expect(parameters_object).to.have.property(key);
			expect(parameters_object[key]).to.equal(required_properties[key]);
		});

	});

	it('Should set method parameters in request object', () => {

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

		let test_controller = new TestController({merchant_provider: merchant_provider});

		let parameters_object = getValidParametersObject();

		let method_parameters = getValidMethodParametersObject();

		parameters_object = test_controller.setMethodParameters({return_parameters: parameters_object, method_parameters: method_parameters});

		const required_properties = {
			username: 'demo',
			password: 'password',
			processor_id: '0'
		};

		objectutilities.map(required_properties, (key) => {
			expect(parameters_object).to.have.property(key);
			expect(parameters_object[key]).to.equal(required_properties[key]);
		});

	});

	it('Should set request parameters in request object', () => {

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');
		let test_controller = new TestController({merchant_provider: merchant_provider});

		let parameters_object = getValidParametersObject();

		let request_parameters = getValidRequestParametersObject();

		parameters_object = test_controller.setRequestParameters({type:'process', request_parameters: request_parameters, return_parameters: parameters_object});

		const required_properties = {
			amount: 100,
			creditcard:{
				number: '5105105105105100',
				cvv: '123',
				exp: '12/2014',
				address:{
					line1: '123 Main St.',
					line2: 'Apartment 1',
					city: 'Dumpsville',
					state: 'NJ',
					zip:'12345',
					country:'US'
				}
			},
			customer:{
				firstname: 'John',
				lastname: 'Doe',
			}
		};

		objectutilities.map(required_properties, (key) => {
			expect(parameters_object).to.have.property(key);
			//expect(parameters_object[key]).to.equal(required_properties[key]);
		});

	});

	it('Should complete a "process" request', () => {

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');
		let test_controller = new TestController({merchant_provider: merchant_provider});

		let parameters_object = getValidParametersObject();
		let method_parameters = getValidMethodParametersObject();
		let request_parameters = getValidRequestParametersObject();

		parameters_object = test_controller.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters_object});
		parameters_object = test_controller.setRequestParameters({type: 'process', request_parameters: request_parameters, return_parameters: parameters_object});

		test_controller.validateRequestParameters('process', parameters_object);

		expect(true).to.equal(true);

	});

	it('Should process a transaction', () => {

		let merchant_provider = getValidMerchantProvider();

		let body = ''
		let response = {
			response:{
				statusMessage:'OK',
				statusCode: 200,
				body: body
			},
			body: body
		};

		mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
			default: class {
				postJSON() {
					return Promise.resolve(response);
				}
			}
		});

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');
		let test_controller = new TestController({merchant_provider: merchant_provider});

		let request_parameters = getValidRequestParametersObject();

		return test_controller.process(request_parameters).then(result => {

			expect(result.getResult()).to.have.property('code');
			expect(result.getResult()).to.have.property('message');
			expect(result.getResult()).to.have.property('response');
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');

		});

	});

	xit('Should reverse a transaction', () => {

		//Technical Debt:  This already exists from the previous test... (derp)
		mockery.registerMock('request', {
			post: (request_options, callback) => {
				callback(null, null, getMockResponse());
			}
		});

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');
		let test_controller = new TestController({merchant_provider: merchant_provider});

		let request_parameters = getValidReverseRequestParametersObject();

		return test_controller.reverse(request_parameters).then(result => {

			expect(result.getResult()).to.have.property('code');
			expect(result.getResult()).to.have.property('message');
			expect(result.getResult()).to.have.property('response');
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');

		});

	});

	xit('Should refund a transaction', () => {

		mockery.registerMock('request', {
			post: (request_options, callback) => {
				callback(null, null, getMockResponse());
			}
		});

		let merchant_provider = getValidMerchantProvider();

		const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

		let test_controller = new TestController({merchant_provider: merchant_provider});

		let request_parameters = getValidRefundRequestParametersObject();

		return test_controller.refund(request_parameters).then(result => {

			expect(result.getResult()).to.have.property('code');
			expect(result.getResult()).to.have.property('message');
			expect(result.getResult()).to.have.property('response');
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');

		});

	});

});
