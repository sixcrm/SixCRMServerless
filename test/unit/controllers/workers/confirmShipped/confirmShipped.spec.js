'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

function getValidShippingProviderResponse(){

  return new ShippingProviderResponse({
    shortname: 'usps',
    parameters: {
      delivered: true,
      status: 'in-transit',
      detail: 'May 30 11:07 am NOTICE LEFT WILMINGTON DE 19801.'
    },
    result: 'success'
  });

}

function getValidMessage(){

  return {
    MessageId:"someMessageID",
    ReceiptHandle:"SomeReceiptHandle",
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"}),
    MD5OfBody:"SomeMD5"
  };

}

function getValidShippingStati(){

  return {};

}

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

function getValidShippingReceipts(){

  return [getValidShippingReceipt(), getValidShippingReceipt(), getValidShippingReceipt()];

}

function getValidTransactionProducts(){

  return [
    {
      product: '80852032-1e28-4d87-80e7-b8e733017390',
      amount: 34.99,
      shippingreceipt: uuidV4()
    },
    {
      product: '4b3ced1d-eb47-4ef5-955d-33762e5f98e5',
      amount: 34.99,
      shippingreceipt: uuidV4()
    }
  ];

}

function getValidRebill(){

  return MockEntities.getValidRebill();

}

function getValidTransactions(){

  return [
    {
      amount: 34.99,
      id: uuidV4(),
      alias:'T'+randomutilities.createRandomString(9),
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      rebill: uuidV4(),
      processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
      merchant_provider: uuidV4(),
      products:[{
        product:uuidV4(),
        amount:34.99
      }],
      type:"sale",
      result:"success",
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    },
    {
      amount: 34.99,
      id: uuidV4(),
      alias:'T'+randomutilities.createRandomString(9),
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      rebill: uuidV4(),
      processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
      merchant_provider: uuidV4(),
      products:[{
        product:uuidV4(),
        amount:34.99
      }],
      type:"sale",
      result:"success",
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    }
  ];

}

describe('controllers/workers/confirmShipped', () => {

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

    it('instantiates the confirmShippedController class', () => {

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      expect(objectutilities.getClassName(confirmedShippedController)).to.equal('confirmShippedController');

    });

  });

  describe('acquireTransactions', () => {

    it('successfully acquires transactions', () => {

      let rebill = getValidRebill();
      let transactions = getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: (rebill) => {
          return Promise.resolve(transactions);
        },
        getResult:(result) => {
          return Promise.resolve(transactions);
        }
      });

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('rebill', rebill);

      return confirmedShippedController.acquireTransactions().then(result => {

        expect(result).to.equal(true);
        expect(confirmedShippedController.parameters.store['transactions']).to.deep.equal(transactions);

      });

    });

  });

  describe('acquireTransactionProducts', () => {

    it('successfully acquires transaction products', () => {

      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts();

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(){
          return transaction_products;
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('transactions', transactions);

      return confirmedShippedController.acquireTransactionProducts().then(result => {

        expect(result).to.equal(true);
        expect(confirmedShippedController.parameters.store['shippedtransactionproducts']).to.deep.equal(transaction_products);

      });

    });

  });

  describe('acquireShippingReceipts', () => {

    it('successfully acquires shipping receipts', () => {

      let transaction_products = getValidTransactionProducts();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(getValidShippingReceipt());
        }
      });

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('shippedtransactionproducts', transaction_products);

      return confirmedShippedController.acquireShippingReceipts().then(result => {

        expect(result).to.equal(true);
        expect(confirmedShippedController.parameters.store['shippingreceipts']).to.be.defined;

      });

    });

  });

  describe('acquireProductShippedStati', () => {

    xit('successfully acquires shipping stati', () => {

      let shipping_receipts = getValidShippingReceipts();
      let shipping_status_object = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingcarriers/ShippingStatus.js'), {
        getStatus:({shipping_provider, shipping_receipt}) => {
          return Promise.resolve(shipping_status_object);
        }
      });

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('shippingreceipts', shipping_receipts);

      return confirmedShippedController.acquireProductShippedStati().then(result => {

        expect(result).to.equal(true);
        expect(confirmedShippedController.parameters.store['productshippedstati']).to.be.defined;

      });

    });

  });

  describe('setShippedStatus', () => {

    it('successfully sets shipped status', () => {

      let product_shipped_stati = [true, true, true];

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('productshippedstati', product_shipped_stati);

      return confirmedShippedController.setShippedStatus().then(result => {

        expect(result).to.equal(true);
        expect(confirmedShippedController.parameters.store['rebillshippedstatus']).to.be.defined;
        expect(confirmedShippedController.parameters.store['rebillshippedstatus']).to.equal(true);

      });

    });

    it('successfully sets shipped status to false', () => {

      let product_shipped_stati = [true, true, false];

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('productshippedstati', product_shipped_stati);

      return confirmedShippedController.setShippedStatus().then(result => {

        expect(result).to.equal(true);
        expect(confirmedShippedController.parameters.store['rebillshippedstatus']).to.be.defined;
        expect(confirmedShippedController.parameters.store['rebillshippedstatus']).to.equal(false);

      });

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      let rebill_shipped_status = true;

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('rebillshippedstatus', rebill_shipped_status);

      let response = confirmedShippedController.respond();

      expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
      expect(response.getCode()).to.equal('success');

    });

    it('successfully responds', () => {

      let rebill_shipped_status = false;

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      confirmedShippedController.parameters.set('rebillshippedstatus', rebill_shipped_status);

      let response = confirmedShippedController.respond();

      expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
      expect(response.getCode()).to.equal('noaction');

    });

  });

  describe('execute', () => {

    xit('successfully executes (success)', () => {

      let message = getValidMessage();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts();
      let shipping_receipts = getValidShippingReceipts();
      let shipping_status_object = getValidShippingProviderResponse();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingcarriers/ShippingStatus.js'), {
        getStatus:({shipping_provider, shipping_receipt}) => {
          return Promise.resolve(shipping_status_object);
        }
      });

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(){
          return transaction_products;
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: (rebill) => {
          return Promise.resolve(transactions);
        },
        getResult:(result) => {
          return Promise.resolve(transactions);
        },
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(getValidShippingReceipt());
        }
      });

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      return confirmedShippedController.execute(message).then((response) => {

        expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
        expect(response.getCode()).to.equal('success');

      });

    });

    xit('successfully executes (noaction)', () => {

      let message = getValidMessage();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts();
      let shipping_receipts = getValidShippingReceipts();
      let shipping_status_object = getValidShippingProviderResponse();

      shipping_status_object.parameters.store['status'] = 'unknown';

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingcarriers/ShippingStatus.js'), {
        getStatus:({shipping_provider, shipping_receipt}) => {
          return Promise.resolve(shipping_status_object);
        }
      });

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(){
          return transaction_products;
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: (rebill) => {
          return Promise.resolve(transactions);
        },
        getResult:(result) => {
          return Promise.resolve(transactions);
        },
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(getValidShippingReceipt());
        }
      });

      let confirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

      return confirmedShippedController.execute(message).then((response) => {

        expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
        expect(response.getCode()).to.equal('noaction');

      });

    });

  });

});
