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

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

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

  return {
    id:uuidV4(),
		"account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		"status":"shipped",
		"trackingnumber": randomutilities.createRandomString(15),
		"trackingstatus": "shipped",
		"created_at":timestamp.getISO8601(),
		"updated_at":timestamp.getISO8601()
  };

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

  return {
    bill_at: "2017-04-06T18:40:41.405Z",
    id: "70de203e-f2fd-45d3-918b-460570338c9b",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    parentsession: "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
    product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
    amount: 79.99,
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

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

describe('controllers/workers/confirmDelivered', () => {

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

    it('instantiates the confirmDeliveredController class', () => {

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      expect(objectutilities.getClassName(confirmedDeliveredController)).to.equal('confirmDeliveredController');

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

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('rebill', rebill);

      return confirmedDeliveredController.acquireTransactions().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['transactions']).to.deep.equal(transactions);

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

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('transactions', transactions);

      return confirmedDeliveredController.acquireTransactionProducts().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['transactionproducts']).to.deep.equal(transaction_products);

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

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('transactionproducts', transaction_products);

      return confirmedDeliveredController.acquireShippingReceipts().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['shippingreceipts']).to.be.defined;

      });

    });

  });

  describe('acquireShippingStati', () => {

    it('successfully acquires shipping stati', () => {

      let shipping_receipts = getValidShippingReceipts();
      let shipping_stati = getValidShippingStati();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/ShippingStatus.js'), {
        isDelivered:(provider, trackingnumber) => {
          return Promise.resolve(true);
        }
      });

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('shippingreceipts', shipping_receipts);

      return confirmedDeliveredController.acquireShippingStati().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['shippingproviderstati']).to.be.defined;

      });

    });

  });

  describe('setDeliveredStatus', () => {

    it('successfully sets delivered status', () => {

      let shipping_stati = [true, true, true];

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('shippingproviderstati', shipping_stati);

      return confirmedDeliveredController.setDeliveredStatus().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['deliveredstatus']).to.be.defined;
        expect(confirmedDeliveredController.parameters.store['deliveredstatus']).to.equal(true);

      });

    });

    it('successfully sets delivered status to false', () => {

      let shipping_stati = [true, true, false];

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('shippingproviderstati', shipping_stati);

      return confirmedDeliveredController.setDeliveredStatus().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['deliveredstatus']).to.be.defined;
        expect(confirmedDeliveredController.parameters.store['deliveredstatus']).to.equal(false);

      });

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      let delivered_status = true;

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('deliveredstatus', delivered_status);

      let response = confirmedDeliveredController.respond();

      expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
      expect(response.getCode()).to.equal('success');

    });

    it('successfully responds', () => {

      let delivered_status = false;

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      confirmedDeliveredController.parameters.set('deliveredstatus', delivered_status);

      let response = confirmedDeliveredController.respond();

      expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
      expect(response.getCode()).to.equal('noaction');

    });

  });

  describe('execute', () => {

    it('successfully executes (success)', () => {

      let message = getValidMessage();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts();
      let shipping_receipts = getValidShippingReceipts();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/ShippingStatus.js'), {
        isDelivered:(provider, trackingnumber) => {
          return Promise.resolve(true);
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

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      return confirmedDeliveredController.execute(message).then((response) => {

        expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
        expect(response.getCode()).to.equal('success');

      });

    });

    it('successfully executes (noaction)', () => {

      let message = getValidMessage();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts();
      let shipping_receipts = getValidShippingReceipts();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/ShippingStatus.js'), {
        isDelivered:(provider, trackingnumber) => {
          return Promise.resolve(false);
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

      let confirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

      return confirmedDeliveredController.execute(message).then((response) => {

        expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
        expect(response.getCode()).to.equal('noaction');

      });

    });

  });

});
