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
const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

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

function getValidSession(){

  return {
    completed: false,
    subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    created_at: '2017-04-06T18:40:41.405Z',
    subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
    subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
    subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    product_schedules: [ '2200669e-5e49-4335-9995-9c02f041d91b' ],
    updated_at: '2017-04-06T18:41:12.521Z',
    affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
    id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
    cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
  };

}

function getValidCustomer(){
  return {
    updated_at: '2017-10-31T20:10:05.380Z',
    lastname: 'Damunaste',
    created_at: '2017-10-14T16:15:19.506Z',
    creditcards: [ 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72' ],
    firstname: 'Rama',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    address:{
      zip: '97213',
      country: 'US',
      state: 'OR',
      city: 'London',
      line1: '10 Downing St.'
    },
    id: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    email: 'rama@damunaste.org',
    phone: '1234567890'
  };
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
		provider:{
      name: "Hashtag",
      threepl_key:'{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
      threepl_customer_id: 10,
      username:"kristest",
      password:"kristest"
    },
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
        getListByAccount:({ids}) => {
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

  describe('marryProductsToAugmentedTransactionProducts', () => {

    it('successfully marrys products to augmented transaction products', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let products = getValidProducts();

      augmented_transaction_products = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product, index) => {
        let updated_augmented_transaction_product = objectutilities.clone(augmented_transaction_product);

        updated_augmented_transaction_product.product = products[index % products.length].id;
        return updated_augmented_transaction_product;
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      shipmentUtilitiesController.parameters.set('products', products);

      let result = shipmentUtilitiesController.marryProductsToAugmentedTransactionProducts();

      expect(result).to.equal(true);
      expect(shipmentUtilitiesController.parameters.store['hydratedaugmentedtransactionproducts']).to.be.defined;

    });

  });

  describe('acquireCustomerFromSession', () => {

    it('successfully acquires a customer from a session', () => {

      let session = getValidSession();
      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        getCustomer:(session) => {
          return Promise.resolve(customer);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('session', session);

      return shipmentUtilitiesController.acquireCustomerFromSession().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['customer']).to.equal(customer);
      });
    });

  });

  describe('acquireRebillFromTransactions', () => {

    it('successfully acquires a rebill from transactions', () => {

      let rebill = getValidRebill();
      let augmented_transaction_products = getValidAugmentedTransactionProducts();

      augmented_transaction_products[0].transaction.rebill = rebill.id;
      augmented_transaction_products[1].transaction.rebill = rebill.id;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

      return shipmentUtilitiesController.acquireRebillFromTransactions().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['rebill']).to.deep.equal(rebill);
      });

    });

  });

  describe('acquireRebill', () => {

    it('successfully acquires a rebill', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('rebillid', rebill.id);

      return shipmentUtilitiesController.acquireRebill().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['rebill']).to.equal(rebill);
      });

    });

  });

  describe('acquireSessionFromRebill', () => {

    it('successfully acquires a session from a rebill', () => {

      let rebill = getValidRebill();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        getSession:({rebill}) => {
          return Promise.resolve(session);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('rebill', rebill);

      return shipmentUtilitiesController.acquireSessionFromRebill().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['session']).to.equal(session);
      });

    });

  });

  describe('acquireCustomerFromSession', () => {

    it('successfully acquires a customer from a session', () => {

      let session = getValidSession();
      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        getCustomer:({session}) => {
          return Promise.resolve(customer);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('session', session);

      return shipmentUtilitiesController.acquireCustomerFromSession().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['customer']).to.equal(customer);
      });

    });

  });

  describe('acquireCustomer', () => {

    it('successfully acquires a customer', () => {

      let rebill = getValidRebill();
      let augmented_transaction_products = getValidAugmentedTransactionProducts();

      augmented_transaction_products[0].transaction.rebill = rebill.id;
      augmented_transaction_products[1].transaction.rebill = rebill.id;

      let session = getValidSession();
      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        getCustomer:({session}) => {
          return Promise.resolve(customer);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        },
        getSession:({rebill}) => {
          return Promise.resolve(session);
        }
      });

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

      return shipmentUtilitiesController.acquireCustomer().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['customer']).to.equal(customer);
      });

    });

  });

  describe('markTransactionProductsWithShippingReceipt', () => {

    it('successfully marks transaction products with a shipping receipt', () => {

      let shipping_receipt = getValidShippingReceipt();
      let augmented_transaction_products = getValidAugmentedTransactionProducts();

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        updateTransactionProduct({id, transaction_product}){
          let transaction = getValidTransaction();

          transaction.products = [transaction_product]
          return Promise.resolve(transaction);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('shippingreceipt', shipping_receipt);
      shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

      return shipmentUtilitiesController.markTransactionProductsWithShippingReceipt().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('instantiateFulfillmentProviderClass', () => {
    it('successfully instantiates a fulfillment provider class', () => {

      let fulfillment_provider = getValidFulfillmentProvider();

      let mock_fulfillment_provider_class = class {
        constructor({fulfillment_provider}){

        }
      }

      mockery.registerMock(global.SixCRM.routes.path('vendors','fulfillmentproviders/Hashtag/handler.js'), mock_fulfillment_provider_class);

      let mock_fulfillment_provider = new mock_fulfillment_provider_class({});

      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      shipmentUtilitiesController.parameters.set('fulfillmentprovider', fulfillment_provider);

      let result = shipmentUtilitiesController.instantiateFulfillmentProviderClass();

      expect(result).to.equal(true);
      expect(shipmentUtilitiesController.parameters.store['instantiatedfulfillmentprovider']).to.deep.equal(mock_fulfillment_provider);

    });

  });

  describe('issueReceipts', () => {

    it('successfully issues a shipping receipt', () => {

      let shipping_receipt = getValidShippingReceipt();

      let mock_terminal_receipt_controller = class {
        constructor(){

        }
        issueReceipt({something}){
          return Promise.resolve(shipping_receipt);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Receipt.js'), mock_terminal_receipt_controller);
      let shipmentUtilitiesController = new ShipmentUtilitiesController();

      return shipmentUtilitiesController.issueReceipts().then(result => {
        expect(result).to.equal(true);
        expect(shipmentUtilitiesController.parameters.store['shippingreceipt']).to.deep.equal(shipping_receipt);
      })

    });

  });

});
