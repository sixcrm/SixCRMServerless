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

const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');

function getValidTransactionProducts(){

  return [
    MockEntities.getValidTransactionProduct(),
    MockEntities.getValidTransactionProduct()
  ];

}

function getValidAugmentedTransactionProducts(){

  let transaction_products = getValidTransactionProducts();

  return arrayutilities.map(transaction_products, transaction_product => {
    return objectutilities.merge(transaction_product, {transaction: getValidTransaction()});
  });

}

function getValidHydratedAugmentedTransactionProducts(){

  return [
    getValidHydratedAugmentedTransactionProduct(),
    getValidHydratedAugmentedTransactionProduct()
  ];

}

function getValidHydratedAugmentedTransactionProduct(){

  return {
    product: getValidProduct(),
    transaction: getValidTransaction(),
    amount: getValidAmount()
  };

}

function getValidAmount(){

  return (randomutilities.randomInt(1000, 10000) * .01);

}

function getValidProduct(){

  return MockEntities.getValidProduct()

}

function getValidTransaction(){
  return MockEntities.getValidTransaction()
}

function getValidVendorResponse(){

  const VendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Hashtag/Response.js');

  return new VendorResponse({
    vendor_response: {
      error: null,
      body: 'Everybody needs somebody.',
      response: {
        body:'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><Int32 xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">1</Int32><warnings xmlns="http://www.JOI.com/schemas/ViaSub.WMS/" /></soap:Body></soap:Envelope>',
        statusCode:200,
        statusMessage:'OK'
      }
    },
    action: 'fulfill',
    additional_parameters: {
      reference_number: uuidV4()
    }
  });

}

function getValidCustomer(){
  return MockEntities.getValidCustomer()
}

function getValidRebill(){
  return MockEntities.getValidRebill();
}

function getValidSession(){
  return MockEntities.getValidSession();
}

function getValidInstantiatedFulfillmentProvider(){

  let processor_response = getValidVendorResponse();
  let fulfillment_provider = class {
    constructor({fulfillment_provider}){}
    fulfill(){
      return Promise.resolve(processor_response);
    }
  }

  return new fulfillment_provider({});

}

function getValidProducts(product_ids){

  let products = [];

  if(_.isUndefined(product_ids)){
    product_ids = [uuidV4(), uuidV4()];
  }

  return arrayutilities.map(product_ids, product_id => {
    return MockEntities.getValidProduct(product_id)
  });

}

function getValidFulfillmentProvider(){

  return MockEntities.getValidFulfillmentProvider()

}

describe('helpers/shipment/Fulfill.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      expect(objectutilities.getClassName(fulfillController)).to.equal('FulfillController');

    });

  });

  describe('executeFulfillment', () => {
    it('successfully executes fulfillment', () => {

      let instantiated_fulfillment_provider = getValidInstantiatedFulfillmentProvider();
      let hydrated_augmented_transaction_products = getValidHydratedAugmentedTransactionProducts();
      let customer = getValidCustomer();

      let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
      fulfillController.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);
      fulfillController.parameters.set('customer', customer);

      return fulfillController.executeFulfillment().then(result => {
        expect(result).to.equal(true);
        expect(fulfillController.parameters.store['providerresponse']).to.be.defined;
      });

    });
  });

  describe('hydrateAugmentedTransactionProducts', () => {
    it('successfully hydrates augmented transaction products', () => {
      let augmented_transaction_products = getValidAugmentedTransactionProducts();

      let mock_shipment_utilities = class {
        constructor(){

        }
        augmentParameters(){
          return true;
        }
        hydrateProducts(){
          return Promise.resolve(true);
        }
        marryProductsToAugmentedTransactionProducts(){
          return Promise.resolve(true);
        }

      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/ShipmentUtilities.js'), mock_shipment_utilities);

      let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      return fulfillController.hydrateAugmentedTransactionProducts().then(result => {
        expect(result).to.equal(true);
      });

    });
  });

  describe('hydrateRequestProperties', () => {

    it('successfully hydrates request properties', () => {

      let mock_shipment_utilities = class {
        constructor(){

        }
        augmentParameters(){
          return true;
        }
        hydrateProducts(){
          return Promise.resolve(true);
        }
        marryProductsToAugmentedTransactionProducts(){
          return Promise.resolve(true);
        }
        hydrateFulfillmentProvider(){
          return Promise.resolve(true);
        }
        acquireCustomer(){
          return Promise.resolve(true);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/ShipmentUtilities.js'), mock_shipment_utilities);

      const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      return fulfillController.hydrateRequestProperties().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('execute', () => {
    it('successfully executes a fulfill', () => {

      let session = getValidSession();
      let rebill = getValidRebill();
      let fulfillment_provider = getValidFulfillmentProvider();
      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let products = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product, index) => {
        augmented_transaction_products[index].transaction.rebill = rebill.id;
        return MockEntities.getValidProduct(augmented_transaction_product.product);
      });

      let vendor_response = getValidVendorResponse();
      let instantiated_fulfillment_provider = getValidInstantiatedFulfillmentProvider();
      let hydrated_augmented_transaction_products = getValidHydratedAugmentedTransactionProducts();
      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), {
        get:({id}) => {
          return Promise.resolve(fulfillment_provider);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        },
        getSession: (rebill) => {
          return Promise.resolve(session);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        getCustomer:(session) => {
          return Promise.resolve(customer);
        },
        get:({id}) => {
          return Promise.resolve(session);
        }
      });

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

      let mock_vendor = class {
        constructor(){

        }
        fulfill(){
          return Promise.resolve(vendor_response);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/'+fulfillment_provider.provider.name+'/handler.js'), mock_vendor);

      const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
      fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
      fulfillController.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);
      fulfillController.parameters.set('customer', customer);

      return fulfillController.execute({
        fulfillment_provider_id: fulfillment_provider.id,
        augmented_transaction_products: augmented_transaction_products
      }).then(result => {
        expect(result).to.deep.equal(vendor_response);
      });

    });
  });

});
