
//const _ = require('lodash');
const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
//const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

//const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
//const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
//const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
//const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

//const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
/*
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
*/
/*
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

  return {
    id:uuidV4(),
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

function getValidProviderResponse(){

  return {
    code:'success',
    response:{
      body: 'everybody needs somebody'
    },
    message:'Success'
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

function getValidInstantiatedFulfillmentProvider(){

  let processor_response = getValidProviderResponse();
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
		provider:"Hashtag",
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  };

}
*/

describe('helpers/shipment/Test.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			let TestController = global.SixCRM.routes.include('helpers', 'shipment/Test.js');
			let testController = new TestController();

			expect(objectutilities.getClassName(testController)).to.equal('TestController');

		});

	});

	/*
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

      let fulfillment_provider = getValidFulfillmentProvider();
      let augmented_transaction_products = getValidAugmentedTransactionProducts();
      let provider_response = getValidProviderResponse();
      let instantiated_fulfillment_provider = getValidInstantiatedFulfillmentProvider();
      let hydrated_augmented_transaction_products = getValidHydratedAugmentedTransactionProducts();
      let customer = getValidCustomer();

      let mock_shipment_utilities = class {
        constructor(){
          const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

          this.transactionHelperController = new TransactionHelperController();

          this.parameter_validation = {
            'products':global.SixCRM.routes.path('model', 'entities/components/products.json'),
            'fulfillmentprovider':global.SixCRM.routes.path('model', 'entities/fulfillmentprovider.json'),
            'fulfillmentproviderid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
            'rebillid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
            'rebill':global.SixCRM.routes.path('model', 'entities/rebill.json'),
            'augmentedtransactionproducts': global.SixCRM.routes.path('model', 'providers/shipping/terminal/augmentedtransactionproducts.json'),
            'augmentedtransactionproduct': global.SixCRM.routes.path('model', 'providers/shipping/terminal/augmentedtransactionproduct.json'),
            'hydratedaugmentedtransactionproducts': global.SixCRM.routes.path('model', 'providers/shipping/terminal/hydratedaugmentedtransactionproducts.json'),
            'customer':global.SixCRM.routes.path('model', 'entities/customer.json'),
            'session':global.SixCRM.routes.path('model', 'entities/session.json'),
            'instantiatedfulfillmentprovider': global.SixCRM.routes.path('model', 'helpers/shipment/instantiatedfulfillmentprovider.json'),
            'shippingreceipt':global.SixCRM.routes.path('model', 'entities/shippingreceipt.json')
          };

          this.parameter_definition = {};

          const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');

          this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

        }
        augmentParameters(){
          du.debug('Augment Parameters');

          this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
          this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

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
        instantiateFulfillmentProviderClass(){
          return true;
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/ShipmentUtilities.js'), mock_shipment_utilities);

      const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
      fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
      fulfillController.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);
      fulfillController.parameters.set('customer', customer);

      return fulfillController.execute({fulfillment_provider_id: fulfillment_provider.id, augmented_transaction_products: augmented_transaction_products}).then(result => {
        expect(result).to.deep.equal(provider_response);
      });

    });
  });
  */
});
