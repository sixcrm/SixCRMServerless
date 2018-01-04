'use strict'

let chai = require('chai');
const uuidV4 = require('uuid/v4');
let expect = chai.expect;
const mockery = require('mockery');

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let randomutilities = global.SixCRM.routes.include('lib', 'random.js');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

function getValidTrackerResponse(carrier){

  return {
    delivered: true,
    status: 'delivered',
    detail: 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.'
  };

}

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

describe('/controllers/helpers/shippingcarriers/ShippingStatus.js', () => {

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
      const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
      let shippingStatusController = new ShippingStatusController();

      expect(objectutilities.getClassName(shippingStatusController)).to.equal('ShippingStatusController');
    });
  });

  describe('getStatus', () => {

    it('successfully return shipping provider status', () => {

      let shipping_receipt = getValidShippingReceipt();

      delete shipping_receipt.history;

      let tracker_response = getValidTrackerResponse('USPS');

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        updateShippingReceipt:(argumentation_object) => {
          shipping_receipt.history = []
          return Promise.resolve(shipping_receipt);
        },
        getTrackingNumber:(shipping_receipt, fatal) => {
          return shipping_receipt.tracking.id;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/tracker/Tracker.js'), class {
        constructor() {

        }
        info({shipping_receipt}){
          return Promise.resolve(tracker_response);
        }
      });

      const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
      let shippingStatusController = new ShippingStatusController();

      return shippingStatusController.getStatus({shipping_receipt: shipping_receipt}).then(result => {
        expect(result).to.deep.equal(tracker_response);
        expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

      });

    });

  });

  describe('isDelivered', () => {

    it('successfully returns boolean delivered status (true)', () => {

      let shipping_receipt = getValidShippingReceipt();

      delete shipping_receipt.history;

      let tracker_response = getValidTrackerResponse('USPS');

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        updateShippingReceipt:(argumentation_object) => {
          shipping_receipt.history = []
          return Promise.resolve(shipping_receipt);
        },
        getTrackingNumber:(shipping_receipt, fatal) => {
          return shipping_receipt.tracking.id;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/tracker/Tracker.js'), class {
        constructor() {

        }
        info({shipping_receipt}){
          return Promise.resolve(tracker_response);
        }
      });

      const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
      let shippingStatusController = new ShippingStatusController();

      return shippingStatusController.isDelivered({shipping_receipt: shipping_receipt}).then(result => {

        expect(result).to.equal(true);
        expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

      });

    });

    it('successfully returns boolean delivered status (false)', () => {

      let shipping_receipt = getValidShippingReceipt();

      delete shipping_receipt.history;

      let tracker_response = getValidTrackerResponse('USPS');

      tracker_response.status = 'intransit';

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        updateShippingReceipt:(argumentation_object) => {
          shipping_receipt.history = []
          return Promise.resolve(shipping_receipt);
        },
        getTrackingNumber:(shipping_receipt, fatal) => {
          return shipping_receipt.tracking.id;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/tracker/Tracker.js'), class {
        constructor() {

        }
        info({shipping_receipt}){
          return Promise.resolve(tracker_response);
        }
      });

      const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
      let shippingStatusController = new ShippingStatusController();

      return shippingStatusController.isDelivered({shipping_receipt: shipping_receipt}).then(result => {

        expect(result).to.equal(false);
        expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

      });

    });

  });

});
