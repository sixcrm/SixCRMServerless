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

const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

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

function getValidTransaction(){
  return {
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
  };
}

function getValidAugmentedTransactionProducts(){

  let transaction_products = getValidTransactionProducts();

  return arrayutilities.map(transaction_products, transaction_product => {
    return objectutilities.merge(transaction_product, {transaction: getValidTransaction()});
  });

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

function getValidFulfillmentProvider(){

  return {
    id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		name: randomutilities.createRandomString(20),
		username: randomutilities.createRandomString(10),
		password: randomutilities.createRandomString(10),
		provider:"HASHTAG",
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  };

}

describe('helpers/shipment/ShipmentUtilities.js', () => {

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

  describe('hydrateFulfillmentProviders', () => {

    it('successfully hydrates fulfillment providers', () => {

      let fulfillment_provider = getValidFulfillmentProvider();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), {
        get:({id}) => {
          return Promise.resolve(fulfillment_provider);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('fulfillmentproviderid', fulfillment_provider.id);

      return shipmentUtilitiesController.hydrateFulfillmentProvider().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['fulfillmentprovider'], fulfillment_provider);
      });

    });

  });

  describe('hydrateProducts', () => {

    it('successfully hydrates products', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let products = getValidProducts();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), {
        getList:({list}) => {
          return Promise.resolve(products);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

      return shipmentUtilitiesController.hydrateProducts().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['products'], products);
      });

    });

  });

});
