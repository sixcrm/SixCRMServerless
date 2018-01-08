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

  return MockEntities.getValidRebill();

}

function getValidSession(){

  return MockEntities.getValidSession();

}

function getValidCustomer(){
  return MockEntities.getValidCustomer();
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
  return MockEntities.getValidTransaction();
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
    return MockEntities.getValidProduct(product_id);
  });

}

function getValidFulfillmentProvider(){

  return MockEntities.getValidFulfillmentProvider();

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
    mockery.resetCache();
    mockery.deregisterAll();
    //global.SixCRM.localcache.clear('all');
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
          return Promise.resolve({products: products});
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = this.descriptive_name+'s';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
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

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        get:({id}) => {
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
        },
        get:({id}) => {
          return Promise.resolve(session);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
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
