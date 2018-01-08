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

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

function getValidTransaction(){

  return getValidTransactions()[0];

}

function getValidTransactions(){

  return [MockEntities.getValidTransaction(),MockEntities.getValidTransaction()];

}

function getValidTransactionProduct(){

  return MockEntities.getValidTransactionProduct()

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
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('getTransactionProducts', () => {

    it('returns transaction products from transaction records', () => {

      let transaction = getValidTransaction();
      let transaction_products = transaction.products;

      let transactionHelperController = new TransactionHelperController();

      let result = transactionHelperController.getTransactionProducts([transaction]);

      expect(result).to.deep.equal(transaction_products);

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
      transactionHelperController.parameters.set('updatedtransactionproducts', [updated_transaction_product]);

      let result = transactionHelperController.updateTransactionProductsPrototype();

      expect(result).to.equal(true);
      expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(updated_transaction);

    });

  });

  describe('updateTransaction', () => {

    it('successfully updates a transaction', () => {

      let transaction = getValidTransaction();
      let updated_transaction = objectutilities.clone(transaction);

      updated_transaction.products[0].shipping_receipt = uuidV4();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let transactionHelperController = new TransactionHelperController();

      transactionHelperController.parameters.set('transaction', updated_transaction);

      return transactionHelperController.updateTransaction().then(result => {
        expect(result).to.equal(true);
        expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(updated_transaction);
      });

    });

  });

});
