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
const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingproviders/components/Response.js');

function getValidShippingProviderResponse(){

  return new ShippingProviderResponse({
    shortname: 'usps',
    parameters: {
      delivered: true,
      status: 'delivered',
      detail: 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.'
    },
    result: 'success'
  });

}

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

describe('/controllers/vendors/shippingproviders/ShippingStatus.js', () => {

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
      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      expect(objectutilities.getClassName(shippingStatusController)).to.equal('ShippingStatusController');
    });
  });

  describe('getTrackingNumber', () => {

    it('successfully acquires a tracking number', () => {

      let shipping_receipt = getValidShippingReceipt();
      let tracking_number = shipping_receipt.trackingnumber;

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        getTrackingNumber:(shipping_receipt, fatal) => {
          return tracking_number;
        }
      });

      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      shippingStatusController.parameters.set('shippingreceipt', shipping_receipt);

      let result = shippingStatusController.getTrackingNumber();

      expect(result).to.equal(true);
      expect(shippingStatusController.parameters.store['trackingnumber']).to.equal(tracking_number)

    });

  });

  describe('getUSPSStatus', () => {

    it('successfully acquires USPS API Response', () => {

      let shipping_receipt = getValidShippingReceipt();
      let tracking_number = shipping_receipt.trackingnumber;
      let shipping_provider_response = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        getTrackingNumber:(shipping_receipt, fatal) => {
          return tracking_number;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/USPS/handler.js'), {
        getStatus:() => {
          return Promise.resolve(shipping_provider_response);
        }
      });

      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      shippingStatusController.parameters.set('shippingreceipt', shipping_receipt);

      return shippingStatusController.getUSPSStatus().then(result => {
        expect(result).to.equal(true);
        expect(shippingStatusController.parameters.store['shippingproviderresponse']).to.deep.equal(shipping_provider_response);
      });

    });

  });

  describe('getProviderStatus', () => {

    it('successfully acquires provider response', () => {

      let shipping_provider = 'usps';
      let shipping_receipt = getValidShippingReceipt();
      let tracking_number = shipping_receipt.trackingnumber;
      let shipping_provider_response = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        getTrackingNumber:(shipping_receipt, fatal) => {
          return tracking_number;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/USPS/handler.js'), {
        getStatus:() => {
          return Promise.resolve(shipping_provider_response);
        }
      });

      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      shippingStatusController.parameters.set('shippingreceipt', shipping_receipt);
      shippingStatusController.parameters.set('shippingprovider', shipping_provider);

      return shippingStatusController.getProviderStatus().then(result => {

        expect(result).to.equal(true);
        expect(shippingStatusController.parameters.store['shippingproviderresponse']).to.deep.equal(shipping_provider_response);

      });

    });

  });

  describe('updateShippingReceiptHistory', () => {

    it('successfully updates shipping receipt history', () => {

      let shipping_provider = 'usps';
      let shipping_receipt = getValidShippingReceipt();
      let tracking_number = shipping_receipt.trackingnumber;
      let shipping_provider_response = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        updateShippingReceipt:(argumentation_object) => {
          shipping_receipt.history = []
          return Promise.resolve(shipping_receipt);
        }
      });

      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      shippingStatusController.parameters.set('shippingreceipt', shipping_receipt);
      shippingStatusController.parameters.set('shippingproviderresponse', shipping_provider_response);

      return shippingStatusController.updateShippingReceiptHistory().then(result => {

        expect(result).to.equal(true);
        expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

      });

    });

  });

  describe('getStatus', () => {

    it('successfully return shipping provider status', () => {

      let shipping_provider = 'usps';
      let shipping_receipt = getValidShippingReceipt();
      let tracking_number = shipping_receipt.trackingnumber;
      let shipping_provider_response = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        updateShippingReceipt:(argumentation_object) => {
          shipping_receipt.history = []
          return Promise.resolve(shipping_receipt);
        },
        getTrackingNumber:(shipping_receipt, fatal) => {
          return tracking_number;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/USPS/handler.js'), {
        getStatus:() => {
          return Promise.resolve(shipping_provider_response);
        }
      });

      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      return shippingStatusController.getStatus({shipping_provider: shipping_provider, shipping_receipt: shipping_receipt}).then(result => {

        expect(result).to.equal(shipping_provider_response);
        expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

      });

    });

  });

  describe('isDelivered', () => {

    it('successfully return shipping provider status', () => {

      let shipping_provider = 'usps';
      let shipping_receipt = getValidShippingReceipt();
      let tracking_number = shipping_receipt.trackingnumber;
      let shipping_provider_response = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), {
        updateShippingReceipt:(argumentation_object) => {
          shipping_receipt.history = []
          return Promise.resolve(shipping_receipt);
        },
        getTrackingNumber:(shipping_receipt, fatal) => {
          return tracking_number;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/USPS/handler.js'), {
        getStatus:() => {
          return Promise.resolve(shipping_provider_response);
        }
      });

      let shippingStatusController = global.SixCRM.routes.include('vendors', 'shippingproviders/ShippingStatus.js');

      return shippingStatusController.isDelivered({shipping_provider: shipping_provider, shipping_receipt: shipping_receipt}).then(result => {


        expect(result).to.equal(true);
        expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

      });

    });

  });

});
