
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidResponse(){

	return {
		error: null,
		response:{
			statusCode: 200,
			statusMessage: 'OK',
			body:{
				success: true,
				code: 200,
				response:{
					reference_number: '03c94bdd-bb88-4d55-a900-ca5665c04c12',
					tracking_number: 'CYKCDDSAR5KRA3WH4WE8',
					carrier: 'USPS'
				}
			}
		},
		body:{
			success: true,
			code: 200,
			response:{
				reference_number: '03c94bdd-bb88-4d55-a900-ca5665c04c12',
				tracking_number: 'CYKCDDSAR5KRA3WH4WE8',
				carrier: 'USPS'
			}
		}
	};

}

function getValidFulfillmentProvider(){
	return MockEntities.getValidFulfillmentProvider();
}

function getValidCustomer(){
	return MockEntities.getValidCustomer();
}

function getValidProducts(product_ids){

	if(_.isUndefined(product_ids)){
		product_ids = [uuidV4(), uuidV4()];
	}

	return arrayutilities.map(product_ids, product_id => {
		return MockEntities.getValidProduct(product_id);
	});

}

function getValidShippingReceipt(){
	return MockEntities.getValidShippingReceipt();
}

describe('vendors/fulfillmentproviders/Test/handler.js', () =>{

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

	describe('constructor', () => {

		it('successfully constructs', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			const TestController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Test/handler.js');
			let testController = new TestController({fulfillment_provider: fulfillment_provider});

			expect(objectutilities.getClassName(testController)).to.equal('TestController');
			expect(testController.parameters.store['fulfillmentprovider']).to.deep.equal(fulfillment_provider);

		});

	});

	describe('test', () => {

		it('successfully executes a test request', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.name = 'Test';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/http-provider.js'), class {
				postJSON() {
					return Promise.resolve(getValidResponse());
				}
			});

			const TestController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Test/handler.js');
			let testController = new TestController({fulfillment_provider: fulfillment_provider});

			return testController.test().then(result => {
				expect(objectutilities.getClassName(result)).to.equal('TestResponse');
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				//expect(result.getResponse().body).to.equal(three_pl_response.body);
				expect(result.getParsedResponse()).to.be.defined;

			});

		});

	});

	describe('info', () => {

		it('successfully executes a test request', () => {

			let fulfillment_provider = getValidFulfillmentProvider();
			let response_object = getValidResponse();

			fulfillment_provider.provider.name = 'Test';
			let shipping_receipt = getValidShippingReceipt();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/http-provider.js'), class {
				postJSON() {
					return Promise.resolve(response_object);
				}
			});

			/*
      let three_pl_response = getValidThreePLResponse('FindOrders');
      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });
      */

			const TestController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Test/handler.js');
			let testController = new TestController({fulfillment_provider: fulfillment_provider});

			return testController.info({shipping_receipt: shipping_receipt}).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('TestResponse');
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				//expect(result.getResponse().body).to.equal(three_pl_response.body);
				expect(result.getParsedResponse()).to.be.defined;

			});

		});

	});

	describe('fulfill', () => {

		it('successfully executes a fulfill request', () => {

			let customer = getValidCustomer();
			let products = getValidProducts();
			let fulfillment_provider = getValidFulfillmentProvider();
			let response_object = getValidResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/http-provider.js'), class {
				postJSON() {
					return Promise.resolve(response_object);
				}
			});

			const TestController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Test/handler.js');
			let testController = new TestController({fulfillment_provider: fulfillment_provider});

			return testController.fulfill({customer: customer, products: products}).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('TestResponse');
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				//expect(result.getResponse().body).to.equal(three_pl_response.body);
			});

		});

	});

});
