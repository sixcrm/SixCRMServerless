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

function getValidFulfillmentProvider(){

  return MockEntities.getValidFulfillmentProvider();

}

function getValidFulfillmentProviderReference(){

  return uuidV4();

}

function getValidTransactionProducts(){

  return [
    {
      amount: 34.99,
      product: uuidV4()
    },
    {
      amount: 34.99,
      product: uuidV4()
    }
  ];

}

function getValidAugmentedTransactionProducts(){

  let transaction_products = getValidTransactionProducts();

  return arrayutilities.map(transaction_products, transaction_product => {

    let transaction = MockEntities.getValidTransaction();

    transaction.products = [transaction_product];

    return objectutilities.merge(transaction_product, {transaction: transaction});

  });

}

describe('/providers/terminal/Receipt.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      const TerminalReceiptGenerator = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
      let terminalReceipt = new TerminalReceiptGenerator();

      expect(objectutilities.getClassName(terminalReceipt)).to.equal('TerminalRecieptGenerator');

    });

  });

  xdescribe('issueReceipt', () => {

    it('successfully issues a new shipping receipt', () => {

      let fulfillment_provider = getValidFulfillmentProvider();
      let augmented_transaction_products = getValidAugmentedTransactionProducts();

      let transactions = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.transaction;
      });

      let fulfillment_provider_reference = getValidFulfillmentProviderReference();
      let shipping_receipt_id = uuidV4();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), {
        get:({id}) => {
          return Promise.resolve(fulfillment_provider);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get:({id}) => {
          let transaction = arrayutilities.find(transactions, transaction => {
            return transaction.id == id;
          });

          return Promise.resolve(transaction);
        },
        update:({entity}) => {
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        create:({entity}) => {
          entity.id = shipping_receipt_id;
          let now = timestamp.getISO8601();

          entity.created_at = now;
          entity.updated_at = now;
          return Promise.resolve(entity);
        }
      });

      const TerminalReceiptGenerator = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
      let terminalReceiptGenerator = new TerminalReceiptGenerator();

      return terminalReceiptGenerator.issueReceipt({
        fulfillment_provider_id: fulfillment_provider.id,
        augmented_transaction_products: augmented_transaction_products,
        fulfillment_provider_reference: fulfillment_provider_reference
      }).then(result => {
        expect(result.id).to.equal(shipping_receipt_id);
      });

    });

  });

});
