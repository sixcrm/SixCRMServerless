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

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

describe('helpers/shippingcarriers/Info.js', () => {

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

      let InfoController = global.SixCRM.routes.include('helpers', 'shippingcarriers/Info.js');
      let infoController = new InfoController();

      expect(objectutilities.getClassName(infoController)).to.equal('InfoController');

    });

  });

  describe('execute', () => {

    it('successfully executes', () => {

      let shipping_receipt = getValidShippingReceipt();

      shipping_receipt.tracking = {
        id:randomutilities.createRandomString(20),
        carrier:'Test'
      };

      let json_response = {
        tracking_number: shipping_receipt.tracking.id,
        status:'delivered',
        address:{
          name: 'John Doe',
          line1: '54321 Shrinking Lane',
          city:'Miniapolis',
          state: 'IN',
          zip: '54321',
          country: 'US'
        },
        detail:{
          detail:"Delivered to front porch",
          delivered_at: timestamp.getISO8601()
        }
      };

      let vendor_response = {
        statusCode: 200,
        body: {
          response: json_response
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('lib', 'http-utilities.js'), {
        postJSON: () => {
          return Promise.resolve({error: null, response: vendor_response, body: json_response});
        }
      });

      let InfoController = global.SixCRM.routes.include('helpers', 'shippingcarriers/Info.js');
      let infoController = new InfoController();

      return infoController.execute({shipping_receipt: shipping_receipt}).then(result => {
        expect(result.getCode()).to.equal('success');
        expect(result.getMessage()).to.equal('Success');
        expect(result.getParsedResponse().detail).to.be.defined;
        expect(result.getParsedResponse().status).to.be.defined;
        expect(result.getParsedResponse().tracking_number).to.be.defined;
      });

    });

  });

});
