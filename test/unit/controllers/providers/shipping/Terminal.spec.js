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

function getValidRebill(){

  return {
    bill_at: timestamp.getISO8601(),
    id: uuidV4(),
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    parentsession: uuidV4(),
    product_schedules: [uuidV4(), uuidV4()],
    amount: 79.99,
    created_at:timestamp.getISO8601(),
    updated_at:timestamp.getISO8601()
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

function getValidProducts(product_ids){

  let products = [];

  if(_.isUndefined(product_ids)){
    product_ids = [uuidV4(), uuidV4()];
  }

  return arrayutilities.map(product_ids, product_id => {
    return {
      id:product_id,
  		name:randomutilities.createRandomString(20),
  		sku:randomutilities.createRandomString(20),
  		ship:true,
      shipping_delay:3600,
  		fulfillment_provider:uuidV4(),
  		default_price:39.99,
  		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		created_at:timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };
  });

}

describe('controllers/workers/shipProduct', function () {

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

    it('successfully constructs', () => {

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      expect(objectutilities.getClassName(shipProductController)).to.equal('shipProductController');

    });

  });

  /*
  describe('hydrateRebillProperties', () => {

    it('successfully hydrates rebill properties', () => {

      let rebill = getValidRebill();
      let transactions =  getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
        listTransactions:(rebill) => {
          return Promise.resolve(transactions);
        }
      });

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      shipProductController.parameters.set('rebill', rebill);

      return shipProductController.hydrateRebillProperties().then(result => {
        expect(result).to.equal(true);
        expect(shipProductController.parameters.store['transactions']).to.deep.equal(transactions);
      });

    });

  });

  describe('hydrateTransactionProducts', () => {

    it('successfully hydrates transaction products', () => {

      let transactions = getValidTransactions();
      let transaction_products = getValidTransactionProducts();

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(transactions){
          return transaction_products;
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      shipProductController.parameters.set('transactions', transactions);

      let result = shipProductController.hydrateTransactionProducts();

      expect(result).to.equal(true);
      expect(shipProductController.parameters.store['transactionproducts']).to.deep.equal(transaction_products);

    });

  });

  describe('hydrateProducts', () => {

    it('successfully hydrates the products', () => {

      let transaction_products = getValidTransactionProducts();
      let products = getValidProducts();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), {
        list:(product_ids) => {
          return Promise.resolve(products);
        }
      });

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      shipProductController.parameters.set('transactionproducts', transaction_products);

      return shipProductController.hydrateProducts().then(result => {
        expect(result).to.equal(true);
        expect(shipProductController.parameters.store['products']).to.deep.equal(products);
      });

    });

  });
  */

});
