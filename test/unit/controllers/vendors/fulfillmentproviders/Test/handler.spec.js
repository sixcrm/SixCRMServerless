'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidReferenceNumber(){

  return uuidV4();

}

function getValidFulfillmentProvider(){

  return MockEntities.getValidFulfillmentProvider();

}

function getValidCustomer(){

  return MockEntities.getValidCustomer();

}

function getValidProducts(product_ids){

  let products = [];

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

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
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

      fulfillment_provider.provider.name = 'Test';
      let shipping_receipt = getValidShippingReceipt();

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

  describe.only('fulfill', () => {

    it('successfully executes a fulfill request', () => {

      let customer = getValidCustomer();
      let products = getValidProducts();
      let fulfillment_provider = getValidFulfillmentProvider();

      /*
      let three_pl_response = getValidThreePLResponse('CreateOrders');
      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });
      */

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
