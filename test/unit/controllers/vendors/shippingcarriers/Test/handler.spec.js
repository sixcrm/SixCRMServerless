'use strict'

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let randomutilities = global.SixCRM.routes.include('lib', 'random.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

let MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidTrackingNumber(){
  return MockEntities.getValidTrackingNumber('Test');
}

describe('vendors/shippingcarriers/Test/handler.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      const TestController = global.SixCRM.routes.include('vendors','shippingcarriers/Test/handler.js');
      let testController = new TestController();

      expect(objectutilities.getClassName(testController)).to.equal('TestController');

    });

  });

  describe('info', () => {

    it('successfully executes', () => {

      let tracking_number = getValidTrackingNumber();

      const TestController = global.SixCRM.routes.include('vendors','shippingcarriers/Test/handler.js');
      let testController = new TestController();

      return testController.info({tracking_number: tracking_number}).then(result => {
        expect(result.getCode()).to.equal('success');
        expect(result.getMessage()).to.equal('Success');
        expect(result.getParsedResponse().tracking_number).to.equal(tracking_number);
        expect(result.getParsedResponse().status).to.be.defined;
        expect(result.getParsedResponse().detail).to.be.defined;
      });

    });

  });

});
