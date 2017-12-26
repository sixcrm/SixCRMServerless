'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

describe('controllers/helpers/entities/shippingreceipt/ShippingReceipt.js', () => {

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

    it('successfully constructs',  () => {

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      expect(objectutilities.getClassName(shippingReceiptHelperController)).to.equal('ShippingReceiptHelperController');

    });

  });

  describe('getTrackingNumber', () => {

    it('successfully return the tracking number', () => {

      let shipping_receipt = getValidShippingReceipt();
      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      let result = shippingReceiptHelperController.getTrackingNumber(shipping_receipt);

      expect(result).to.equal(shipping_receipt.trackingnumber);

    });

    it('successfully returns null when the tracking number is not provided', () => {

      let shipping_receipt = getValidShippingReceipt();

      delete shipping_receipt.trackingnumber;

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      let result = shippingReceiptHelperController.getTrackingNumber(shipping_receipt);

      expect(result).to.equal(null);

    });

    it('successfully throws an error when the tracking number is not provided', () => {

      let shipping_receipt = getValidShippingReceipt();

      delete shipping_receipt.trackingnumber;

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      try{
        shippingReceiptHelperController.getTrackingNumber(shipping_receipt, true);
      }catch(error){
        expect(error.message).to.equal('[500] Shipping Receipt missing property "trackingnumber"');
      }

    });

  });

  describe('acquireShippingReceipt', () => {

    it('successfully acquires a shipping receipt', () => {

      let shipping_receipt = getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(shipping_receipt);
        }
      });

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      shippingReceiptHelperController.parameters.set('shippingreceipt', shipping_receipt);

      return shippingReceiptHelperController.acquireShippingReceipt().then(result => {
        expect(result).to.equal(true);
        expect(shippingReceiptHelperController.parameters.store['shippingreceipt']).to.deep.equal(shipping_receipt);
      });
    });

  });

  describe('pushUpdatedShippingReceipt', () => {

    it('successfully pushes the updated shipping receipt', () => {

      let shipping_receipt = getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), {
        update:({entity}) => {
          return Promise.resolve(shipping_receipt);
        }
      });

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      shippingReceiptHelperController.parameters.set('updatedshippingreceipt', shipping_receipt);

      return shippingReceiptHelperController.pushUpdatedShippingReceipt().then(result => {
        expect(result).to.equal(true);
        expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.deep.equal(shipping_receipt);
      });
    });

  });

  xdescribe('buildUpdatedShippingReceiptPrototype', () => {

    it('successfully builds the updated shipping receipt prototype', () => {

      let shipping_receipt = getValidShippingReceipt();

      let shipping_status = 'delivered';
      let shipping_detail = 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.';

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      shippingReceiptHelperController.parameters.set('shippingreceipt', shipping_receipt);
      shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);
      shippingReceiptHelperController.parameters.set('shippingdetail', shipping_detail)

      let result = shippingReceiptHelperController.buildUpdatedShippingReceiptPrototype();

      expect(result).to.equal(true);
      expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.be.defined;
      expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].status).to.equal(shipping_status);
      expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].trackingstatus).to.equal(shipping_status);
      expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].history[0].detail).to.equal(shipping_detail);

    });

  });

  xdescribe('updateShippingReceipt', () => {

    it('successfully updates a shipping receipt', () => {

      let shipping_receipt = getValidShippingReceipt();

      shipping_receipt.status = 'in-transit';
      shipping_receipt.trackingstatus = 'in-transit';

      let shipping_status = 'delivered';
      let shipping_detail = 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.';

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(shipping_receipt);
        },
        update:({entity}) => {
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      let shippingReceiptHelperController = new ShippingReceiptHelperController();

      return shippingReceiptHelperController.updateShippingReceipt({shipping_receipt: shipping_receipt, detail: shipping_detail, status: shipping_status })
      .then(result => {
        expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.be.defined;
        expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].status).to.equal(shipping_status);
        expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].trackingstatus).to.equal(shipping_status);
        expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].history[0].detail).to.equal(shipping_detail);
      });

    });

  });

});
