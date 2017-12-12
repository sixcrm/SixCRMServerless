'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

function getValidTransaction(){

  return getValidTransactions()[0];

}

function getValidTransactions(){

  return [{
    amount: 34.99,
    id: "d376f777-3e0b-43f7-a5eb-98ee109fa2c5",
    alias:"T56S2HJ922",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    rebill: "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    merchant_provider: "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    products:[{
      product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
      amount:34.99
    }],
    type:"reverse",
    result:"success",
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  },
  {
    amount: 13.22,
    id: "d376f777-3e0b-43f7-a5eb-98ee109fa2c5",
    alias:"T56S2HJ922",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    rebill: "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    merchant_provider: "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    products:[{
      product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
      amount:34.99
    }],
    type:"refund",
    result:"success",
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  }];

}

function getValidTransactionProduct(){

  return {
    product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
    amount:34.99
  }

}

describe('helpers/entities/transaction/Transaction.js', () => {

  before(() => {

    PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

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

  describe('getTransactionProducts', () => {

    it('returns transaction products from transaction records', () => {

      let transaction = getValidTransaction();
      let expected_transaction_products = [
        {
          "amount": 34.99,
          "product": "be992cea-e4be-4d3e-9afa-8e020340ed16"
        }
      ];

      let transactionHelperController = new TransactionHelperController();

      let result = transactionHelperController.getTransactionProducts([transaction]);

      expect(result).to.deep.equal(expected_transaction_products);

    });

  });

  describe('markTransactionChargeback', () => {

    it('updates a transaction record as "chargeback" (true)', () => {

      let transaction = getValidTransaction();
      let expected_transaction = objectutilities.clone(transaction);

      expected_transaction.chargeback = true;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get:({id}) => {
          return Promise.resolve(transaction);
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let transactionHelperController = new TransactionHelperController();

      return transactionHelperController.markTransactionChargeback({transactionid: transaction.id, chargeback_status: true}).then(result => {

        expect(transactionHelperController.parameters.store['transaction'].chargeback).to.equal(true);

      })

    });

    it('updates a transaction record as "non-chargeback" (false)', () => {

      let transaction = getValidTransaction();

      transaction.chargeback = true;

      let expected_transaction = objectutilities.clone(transaction);

      delete expected_transaction.chargeback;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get:({id}) => {
          return Promise.resolve(transaction);
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let transactionHelperController = new TransactionHelperController();

      return transactionHelperController.markTransactionChargeback({transactionid: transaction.id, chargeback_status: false}).then(result => {

        expect(transactionHelperController.parameters.store['transaction'].chargeback).to.equal(false);

      });

    });

  });

  describe('updateTransactionProductsPrototype', () => {

    it('successfully updates the local transaction model with a new transaction prototype', () => {

      let transaction = getValidTransaction();
      let updated_transaction_product = transaction.products[0];

      updated_transaction_product.shipping_receipt = uuidV4();

      let updated_transaction = objectutilities.clone(transaction);

      updated_transaction.products[0] = updated_transaction_product;

      let transactionHelperController = new TransactionHelperController();

      transactionHelperController.parameters.set('transaction', transaction);
      transactionHelperController.parameters.set('transactionproduct', updated_transaction_product);

      let result = transactionHelperController.updateTransactionProductsPrototype();

      expect(result).to.equal(true);
      expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(updated_transaction);

    });

  });

  describe('updateTransactionProduct', () => {

    it('successfully updates a transaction product', () => {

      let transaction = getValidTransaction();
      let updated_transaction_product = transaction.products[0];

      updated_transaction_product.shipping_receipt = uuidV4();

      let updated_transaction = objectutilities.clone(transaction);

      updated_transaction.products[0] = updated_transaction_product;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get:({id}) => {
          return Promise.resolve(transaction);
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let transactionHelperController = new TransactionHelperController();

      return transactionHelperController.updateTransactionProduct({id: transaction.id, transaction_product: updated_transaction_product}).then(result => {
        expect(result).to.deep.equal(updated_transaction);
      });

    });

  });

});
