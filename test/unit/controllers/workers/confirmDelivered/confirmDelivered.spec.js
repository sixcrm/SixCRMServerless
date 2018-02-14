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

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

}

function getValidShippingStati(){

  return {};

}

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

function getValidShippingReceipts(){

  return [
    getValidShippingReceipt(),
    getValidShippingReceipt(),
    getValidShippingReceipt()
  ];

}

function getValidTransactionProducts(ids, expanded){

  return MockEntities.getValidTransactionProducts(ids, expanded);

}

function getValidRebill(id){

  return MockEntities.getValidRebill(id);

}

function getValidTransaction(id){

  return MockEntities.getValidTransaction(id);

}

function getValidTransactions(){

  return [
    getValidTransaction(),
    getValidTransaction()
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
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('instantiates the confirmDeliveredController class', () => {

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

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

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

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
      let transaction_products = getValidTransactionProducts(null, true);

      transaction_products.forEach(transaction_product => {
          transaction_product.shipping_receipt = uuidV4()
      });

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(){
          return transaction_products;
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('transactions', transactions);

      return confirmedDeliveredController.acquireTransactionProducts().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['shippedtransactionproducts']).to.deep.equal(transaction_products);

      });

    });

  });

  describe('acquireShippingReceipts', () => {

    it('successfully acquires shipping receipts', () => {

      let transaction_products = getValidTransactionProducts(null, true);

      transaction_products.forEach(transaction_product => {
          transaction_product.shipping_receipt = uuidV4()
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        get:({id}) => {
          return Promise.resolve(getValidShippingReceipt());
        }
      });

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('shippedtransactionproducts', transaction_products);

      return confirmedDeliveredController.acquireShippingReceipts().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['shippingreceipts']).to.be.defined;

      });

    });

  });

  describe('acquireProductDeliveredStati', () => {

    it('successfully acquires shipping stati', () => {

      let shipping_receipts = getValidShippingReceipts();
      let shipping_stati = getValidShippingStati();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), class {
        constructor(){}
        isDelivered(provider, trackingnumber){
          return Promise.resolve(true);
        }
      });

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('shippingreceipts', shipping_receipts);

      return confirmedDeliveredController.acquireProductDeliveredStati().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['productdeliveredstati']).to.be.defined;

      });

    });

  });

  describe('setDeliveredStatus', () => {

    it('successfully sets delivered status', () => {

      let product_delivered_stati = [true, true, true];

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('productdeliveredstati', product_delivered_stati);

      return confirmedDeliveredController.setDeliveredStatus().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.be.defined;
        expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.equal(true);

      });

    });

    it('successfully sets delivered status to false', () => {

      let product_delivered_stati = [true, true, false];

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('productdeliveredstati', product_delivered_stati);

      return confirmedDeliveredController.setDeliveredStatus().then(result => {

        expect(result).to.equal(true);
        expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.be.defined;
        expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.equal(false);

      });

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      let rebill_delivered_status = true;

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('rebilldeliveredstatus', rebill_delivered_status);

      let response = confirmedDeliveredController.respond();

      expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
      expect(response.getCode()).to.equal('success');

    });

    it('successfully responds', () => {

      let rebill_delivered_status = false;

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      confirmedDeliveredController.parameters.set('rebilldeliveredstatus', rebill_delivered_status);

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
      let transaction_products = getValidTransactionProducts(null, true);
      let shipping_receipt = getValidShippingReceipt();

      transaction_products.forEach(transaction_product => {
          transaction_product.shipping_receipt = uuidV4()
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), class {
        constructor(){}
        isDelivered(provider, trackingnumber){
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
          return Promise.resolve(shipping_receipt);
        }
      });

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      return confirmedDeliveredController.execute(message).then((response) => {

        expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
        expect(response.getCode()).to.equal('success');

      });

    });

    it('successfully executes (noaction)', () => {

      let message = getValidMessage();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts(null, true);
      let shipping_receipt = getValidShippingReceipt();

      transaction_products.forEach(transaction_product => {
          transaction_product.shipping_receipt = uuidV4()
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), class {
        constructor(){}
        isDelivered(provider, trackingnumber){
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
          return Promise.resolve(shipping_receipt);
        }
      });

      const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
      let confirmedDeliveredController = new ConfirmedDeliveredController();

      return confirmedDeliveredController.execute(message).then((response) => {

        expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
        expect(response.getCode()).to.equal('noaction');

      });

    });

  });

});
