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

function getValidShippingReceipt(){

  return {
    id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		status:"pending",
		trackingnumber: randomutilities.createRandomString(10),
		trackingstatus: "intransit",
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  };

}

function getValidGroupedShipableTransactionProducts(){

  let return_object = {};

  return_object[uuidV4()] = getValidAugmentedTransactionProducts();
  return_object[uuidV4()] = getValidAugmentedTransactionProducts();

  return return_object;

}

function getValidCompoundFulfillmentResponse(){

  return {
    shipping_receipt: getValidShippingReceipt(),
    fulfillment_response: getValidFulfillmentResponse()
  };

}

function getValidFulfillmentResponse(){

  const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Hashtag/Response.js');
  let response = new FulfillmentResponse({error: null, response: {statusCode: 200, body: 'um'}, body:'um'});

  return response;

}

function getValidFulfillmentProviders(){

  return [
    getValidFulfillmentProvider(),
    getValidFulfillmentProvider()
  ];

}

function getValidFulfillmentProvider(){

  return {
    id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    name: randomutilities.createRandomString(20),
		provider:{
      name:"Hashtag",
      username: 'kristest',
  		password: 'kristest',
      threepl_key:'{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
      threepl_customer_id: 10
    },
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  };

}

function getValidShippableTransactionProductGroup(){

  return getValidAugmentedTransactionProducts();

}

function getValidAugmentedTransactionProducts(){

  let transaction_products = getValidTransactionProducts();

  return arrayutilities.map(transaction_products, transaction_product => {
    return objectutilities.merge(transaction_product, {transaction: getValidTransaction()});
  });

}

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

function getValidTransactions(){

  return [
    getValidTransaction(),
    getValidTransaction()
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

describe('controllers/providers/terminal/Terminal.js', function () {

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

  describe('acquireRebill', () => {
    it('successfully acquires a rebill', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      })

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('rebill', rebill);

      return terminalController.acquireRebill().then(result => {

        expect(result).to.equal(true);
        expect(terminalController.parameters.store['rebill']).to.deep.equal(rebill);

      });
    });
  });

  describe('acquireTransactions', () => {
    it('successfully acquires rebill transactions', () => {

      let rebill = getValidRebill();
      let transactions =  getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions:(rebill) => {
          return Promise.resolve(transactions);
        }
      });

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('rebill', rebill);

      return terminalController.acquireTransactions().then(result => {

        expect(result).to.equal(true);
        expect(terminalController.parameters.store['transactions']).to.deep.equal(transactions);

      });
    });
  });

  describe('setAugmentedTransactionProducts', () => {

    it('successfully sets augmented transaction products', () => {

      let transactions = getValidTransactions();

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(transactions){
          return getValidTransactionProducts();
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('transactions', transactions);

      let result = terminalController.setAugmentedTransactionProducts();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['augmentedtransactionproducts']).to.be.defined;

    });

  });

  describe('acquireProducts', () => {

    it('successfully acquires products', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let products = getValidProducts();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), {
        getListByAccount:({ids}) => {
          return Promise.resolve(products);
        }
      });

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

      return terminalController.acquireProducts().then(result => {
        expect(result).to.equal(true);
        expect(terminalController.parameters.store['products']).to.deep.equal(products);
      });

    });

  });

  describe('getShipableProductIDs', () => {

    it('successfully sets shippable product ids (mixed case)', () => {

      let products = getValidProducts();

      products[0].ship = false;
      products[1].ship = true;

      let shipable_products = [products[1].id];

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);

      let result = terminalController.getShipableProductIDs();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipableproductids']).to.deep.equal(shipable_products);

    });

    it('successfully sets shippable product ids (all)', () => {

      let products = getValidProducts();

      products[0].ship = true;
      products[1].ship = true;

      let shipable_products = [products[0].id, products[1].id];

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);

      let result = terminalController.getShipableProductIDs();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipableproductids']).to.deep.equal(shipable_products);

    });

    it('successfully sets shippable product ids (none)', () => {

      let products = getValidProducts();

      products[0].ship = false;
      products[1].ship = false;

      let shipable_products = [];

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);

      let result = terminalController.getShipableProductIDs();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipableproductids']).to.deep.equal(shipable_products);

    });

  });

  describe('createShipableTransactionProductGroup', () => {

    it('successfully creates a shipable transaction product group', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal(augmented_transaction_products);

    });

    it('successfully creates a shipable transaction product group (subset)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      shipable_product_ids.pop();

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[0]]);

    });

    it('successfully creates a shipable transaction product group (subset-2)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      shipable_product_ids.shift();

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[1]]);

    });

    it('successfully creates a shipable transaction product group (none)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = [];

      shipable_product_ids.pop();

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([]);

    });

    it('successfully creates a shipable transaction product group (subset - shipping_receipt)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      augmented_transaction_products[0].shipping_receipt = uuidV4();

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[1]]);

    });

    it('successfully creates a shipable transaction product group (subset2 - shipping_receipt)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      augmented_transaction_products[0].shipping_receipt = uuidV4();
      augmented_transaction_products[1].shipping_receipt = uuidV4();

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([]);

    });

    it('successfully creates a shipable transaction product group (subset - no_ship)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      augmented_transaction_products[0].no_ship = true;

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[1]]);

    });

    it('successfully creates a shipable transaction product group (none - no_ship)', () => {

      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
        return augmented_transaction_product.product;
      });

      augmented_transaction_products[0].no_ship = true;
      augmented_transaction_products[1].no_ship = true;

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
      terminalController.parameters.set('shipableproductids', shipable_product_ids);

      let result = terminalController.createShipableTransactionProductGroup();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([]);

    });

  });

  describe('groupShipableTransactionProductGroupByFulfillmentProvider', () => {

    it('successfully groups shipable products by fulfillment providers (empty)', () => {

      let shippable_transaction_product_group = getValidShippableTransactionProductGroup();
      let products = getValidProducts();

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);
      terminalController.parameters.set('shipabletransactionproductgroup', shippable_transaction_product_group);

      let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal({});

    });

    it('successfully groups shipable products by fulfillment providers (one group)', () => {

      let shipable_transaction_product_group = getValidShippableTransactionProductGroup();
      let products = getValidProducts();

      products[0].id = shipable_transaction_product_group[0].product;
      products[1].id = shipable_transaction_product_group[1].product;
      products[1].fulfillment_provider = products[0].fulfillment_provider;

      let grouped_products = {}

      grouped_products[products[1].fulfillment_provider] = shipable_transaction_product_group;

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);
      terminalController.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

      let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal(grouped_products);

    });

    it('successfully groups shipable products by fulfillment providers (one group)', () => {

      let shipable_transaction_product_group = getValidShippableTransactionProductGroup();
      let products = getValidProducts();

      products[0].id = shipable_transaction_product_group[0].product;
      products[1].id = shipable_transaction_product_group[1].product;
      products[1].fulfillment_provider = products[0].fulfillment_provider;

      let grouped_products = {}

      grouped_products[products[1].fulfillment_provider] = shipable_transaction_product_group;

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);
      terminalController.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

      let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal(grouped_products);

    });

    it('successfully groups shipable products by fulfillment providers (two groups)', () => {

      let shipable_transaction_product_group = getValidShippableTransactionProductGroup();
      let products = getValidProducts();

      products[0].id = shipable_transaction_product_group[0].product;
      products[1].id = shipable_transaction_product_group[1].product;

      let grouped_products = {}

      grouped_products[products[0].fulfillment_provider] = [shipable_transaction_product_group[0]];
      grouped_products[products[1].fulfillment_provider] = [shipable_transaction_product_group[1]];

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('products', products);
      terminalController.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

      let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

      expect(result).to.equal(true);
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
      expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal(grouped_products);

    });

  });

  describe('executeFulfillment', () => {

    it('successfully executes', () => {

      let grouped_shipable_transaction_products = getValidGroupedShipableTransactionProducts();

      let mocked_fulfillment_class = class {
        constructor(){

        }
        execute({fulfillment_provider_id, augmented_transaction_products}){
          return Promise.resolve(getValidFulfillmentResponse());
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/Fulfill.js'), mocked_fulfillment_class);

      let mocked_terminal_receipt_class = class {
        constructor(){

        }
        issueReceipt({fulfillment_provider, fulfillment_response, augmented_transaction_products}){
          return Promise.resolve(getValidShippingReceipt());
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Receipt.js'), mocked_terminal_receipt_class);

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('groupedshipabletransactionproducts', grouped_shipable_transaction_products);

      return terminalController.executeFulfillment().then(result => {

        expect(result).to.equal(true);

        arrayutilities.map(terminalController.parameters.get('compoundfulfillmentresponses'), compound_fulfillment_response => {
          expect(compound_fulfillment_response.fulfillment_response.getCode()).to.equal('success');
        });

      });

    });

  });

  describe('transformCompoundFulfillmentResponses', () => {

    it('successfully evaluates compound fulfillment responses', () => {

      let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

      let response = terminalController.transformCompoundFulfillmentResponses();

      expect(response).to.equal(true);
      expect(terminalController.parameters.store['responsecode']).to.equal('success');

    });

    it('successfully evaluates fulfillment responses (fail)', () => {

      let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

      compound_fulfillment_responses[0].fulfillment_response.setCode('fail');

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

      let response = terminalController.transformCompoundFulfillmentResponses();

      expect(response).to.equal(true);
      expect(terminalController.parameters.store['responsecode']).to.equal('fail');

    });

    it('successfully evaluates fulfillment responses (error)', () => {

      let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

      compound_fulfillment_responses[0].fulfillment_response.setCode('error');

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

      let response = terminalController.transformCompoundFulfillmentResponses();

      expect(response).to.equal(true);
      expect(terminalController.parameters.store['responsecode']).to.equal('error');

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      terminalController.parameters.set('responsecode', 'success');

      let result = terminalController.respond();

      expect(result.getCode()).to.equal('success');

    });

  });

  xdescribe('test', () => {

    it('Successfully executes a test of a fulfillment provider', () => {

      let fulfillment_provider = getValidFulfillmentProvider();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), {
        get:({id}) => {
          return Promise.resolve(fulfillment_provider);
        }
      });

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      return terminalController.test({fulfillment_provider_id: fulfillment_provider.id}).then(result => {

        du.info(result); process.exit();

      });

    });

  });

  describe('fulfill', () => {

    it('successfully ships a rebill', () => {

      let rebill = getValidRebill();
      let products = getValidProducts();
      let transactions = getValidTransactions();
      let shipping_receipt = getValidShippingReceipt();

      let mocked_receipt_class = class {
        constructor(){

        }
        issueReceipt({allparameters}){
          return Promise.resolve(shipping_receipt);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Receipt.js'), mocked_receipt_class);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions:(rebill) => {
          return Promise.resolve(transactions);
        },
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      let mock_transaction_helper_controller = class {
        constructor(){

        }
        getTransactionProducts(transactions){
          return getValidTransactionProducts();
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), {
        getListByAccount:({ids}) => {
          return Promise.resolve(products);
        }
      });

      let mocked_fulfillment_class = class {
        constructor(){

        }
        execute({fulfillment_provider_id, augmented_transaction_products}){
          return Promise.resolve(getValidFulfillmentResponse());
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/Fulfill.js'), mocked_fulfillment_class);

      const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
      let terminalController = new TerminalController();

      return terminalController.fulfill({rebill: rebill}).then(result => {
        expect(result.getCode()).to.equal('success');
      });

    });

  });

});
