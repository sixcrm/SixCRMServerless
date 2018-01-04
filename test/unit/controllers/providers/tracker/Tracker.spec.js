'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidShippingReceipt(){
  return MockEntities.getValidShippingReceipt();
}
describe('controllers/providers/tracker/Tracker.js', function () {

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

      const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
      let trackerController = new TrackerController();

      expect(objectutilities.getClassName(trackerController)).to.equal('TrackerController');

    });

  });

  describe('info', () => {

    it('successfully executes the info method', () => {

      let shipping_receipt = getValidShippingReceipt();

      shipping_receipt.tracking = {
        carrier: 'Test',
        id: randomutilities.createRandomString(20)
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(shipping_receipt);
        }
      });

      const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
      let trackerController = new TrackerController();

      return trackerController.info({shipping_receipt: shipping_receipt}).then(result => {
        expect(result.getVendorResponse()).to.have.property('detail');
        expect(result.getVendorResponse()).to.have.property('status');
        expect(result.getVendorResponse()).to.have.property('tracking_number');
      });

    });

  });

});
