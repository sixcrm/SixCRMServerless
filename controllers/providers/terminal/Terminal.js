'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

const FulfillmentController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
const TestController = global.SixCRM.routes.include('helpers', 'shipment/Test.js');

const TerminalReceiptController = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');

module.exports = class TerminalController extends PermissionedController  {

  constructor(){

    super();

    this.parameter_definition = {
      fulfill:{
        required: {
          rebill: 'rebill'
        },
        optional:{}
      },
      info:{
        required: {
          shippingreceipt:'shippingreceipt'
        },
        optional:{}
      },
      test:{
        required:{
          fulfillmentproviderid: 'fulfillment_provider_id'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
      transactions: global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
      augmentedtransactionproducts: global.SixCRM.routes.path('model', 'providers/shipping/terminal/augmentedtransactionproducts.json'),
      products: global.SixCRM.routes.path('model', 'entities/components/products.json'),
      shipableproductids: global.SixCRM.routes.path('model', 'providers/shipping/terminal/shipableproductids.json'),
      shipabletransactionproductgroup: global.SixCRM.routes.path('model', 'providers/shipping/terminal/shipabletransactionproductgroup.json'),
      groupedshipabletransactionproducts: global.SixCRM.routes.path('model', 'providers/shipping/terminal/groupedshipabletransactionproducts.json'),
      fulfillmentproviders: global.SixCRM.routes.path('model', 'entities/components/fulfillmentproviders.json'),
      selectedfulfillmentproviderid: global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
      selectedfulfillmentprovider: global.SixCRM.routes.path('model', 'entities/fulfillmentprovider.json'),
      instantiatedfulfillmentprovider: global.SixCRM.routes.path('model', 'providers/shipping/terminal/instantiatedfulfillmentprovider.json'),
      compoundfulfillmentresponses: global.SixCRM.routes.path('model', 'providers/shipping/terminal/compoundfulfillmentresponses.json'),
      responsecode: global.SixCRM.routes.path('model', 'providers/shipping/terminal/responsecode.json'),
      fulfillmentproviderid: global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
      fulfillmentprovider: global.SixCRM.routes.path('model', 'entities/fulfillmentprovider.json')
    };

    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    this.productController = global.SixCRM.routes.include('entities', 'Product.js');
    this.fulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');

    const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

    this.transactionHelperController = new TransactionHelperController();

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  fulfill({rebill}){

    du.debug('Fulfill');

    //Takes a rebill
    //Responds with shipping receipts
    //Marks the shipping receipts behind the scenes

    return Promise.resolve(true)
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'fulfill'}))
    .then(() => this.acquireRebill())
    .then(() => this.acquireTransactions())
    .then(() => this.setAugmentedTransactionProducts())
    .then(() => this.acquireProducts())
    .then(() => this.getShipableProductIDs())
    .then(() => this.createShipableTransactionProductGroup())
    .then(() => this.groupShipableTransactionProductGroupByFulfillmentProvider())
    .then(() => this.executeFulfillment())
    .then(() => this.transformCompoundFulfillmentResponses())
    .then(() => this.respond());

  }

  info({shippingreceipt}){

    du.debug('info');
    //Takes a shipping receipt
    //Returns a tracking number
    return Promise.resolve(true)
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'info'}))
    .then(() => this.acquireShippingReceipt())
    .then(() => this.executeInfo())
    .then(() => this.respond());

  }

  test({fulfillment_provider_id}){

    du.debug('Test');

    //takes a fulfillment provider id
    //returns success/fail/error
    //returns vendor response

    return Promise.resolve(true)
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'test'}))
    .then(() => this.executeTest())
    .then(() => this.transformTestResponse())
    .then(() => this.respond());

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let rebill = this.parameters.get('rebill');

    return this.rebillController.get({id: rebill.id}).then(result => {
      this.parameters.set('rebill', rebill);
      return true;
    });

  }

  acquireTransactions(){

    du.debug('Acquire Transactions');

    let rebill = this.parameters.get('rebill');

    return this.rebillController.listTransactions(rebill).then(transactions => {
      this.parameters.set('transactions', transactions);
      return true;
    });

  }

  setAugmentedTransactionProducts(){

    du.debug('Set Transaction Products');

    let transactions = this.parameters.get('transactions');

    let augmented_transaction_products = arrayutilities.map(transactions, transaction => {

      let transaction_products = this.transactionHelperController.getTransactionProducts([transaction]);

      return arrayutilities.map(transaction_products, (transaction_product, index) => {
        let augmented_transaction_product = objectutilities.clone(transaction_product);

        augmented_transaction_product.transaction = transaction;
        return augmented_transaction_product;
      });

    });

    augmented_transaction_products = arrayutilities.flatten(augmented_transaction_products);

    this.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

    return true;

  }

  acquireProducts(){

    du.debug('Acquire Products');

    let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

    let product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
      return augmented_transaction_product.product;
    });

    product_ids = arrayutilities.unique(product_ids);

    return this.productController.getListByAccount({ids: product_ids}).then(products => {
      this.parameters.set('products', products);
      return true;
    });

  }

  getShipableProductIDs(){

    du.debug('Get Shipable Product IDs');

    let products = this.parameters.get('products');

    let shipable_products = arrayutilities.filter(products, (product) => {
      return product.ship;
    });

    shipable_products = arrayutilities.unique(shipable_products);

    let shipable_product_ids = arrayutilities.map(shipable_products, shipable_product => {
      return shipable_product.id;
    });

    this.parameters.set('shipableproductids', shipable_product_ids);

    return true;

  }

  createShipableTransactionProductGroup(){

    du.debug('Create Shipable Transaction Product Group');

    let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');
    let shipable_product_ids = this.parameters.get('shipableproductids');

    let shipable_transaction_product_group = arrayutilities.filter(augmented_transaction_products, augmented_transaction_product => {

      if(_.has(augmented_transaction_product, 'shipping_receipt')){
        return false;
      }

      if(_.has(augmented_transaction_product, 'no_ship')){
        return false;
      }

      return _.contains(shipable_product_ids, augmented_transaction_product.product);

    });

    this.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

    return true;

  }

  groupShipableTransactionProductGroupByFulfillmentProvider(){

    du.debug('Group Shipable Transaction Product Group By Fulfillment Provider');

    let shipable_transaction_products = this.parameters.get('shipabletransactionproductgroup');
    let products = this.parameters.get('products');

    let grouped_shipable_transaction_products_object = arrayutilities.group(shipable_transaction_products, (shipable_transaction_product) => {

      let matching_product = arrayutilities.find(products, product => {
        return (product.id == shipable_transaction_product.product);
      });

      if(_.has(matching_product, 'fulfillment_provider')){
        return matching_product.fulfillment_provider;
      }

      return null;

    });

    this.parameters.set('groupedshipabletransactionproducts', grouped_shipable_transaction_products_object);

    return true;

  }

  executeTest(){

    du.debug('Execute Test');

    let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

    let testController = new TestController();

    return testController.execute({fulfillment_provider_id: fulfillment_provider_id}).then(result => {

      this.parameters.set('vendorresponse', result);

      return true;

    });

  }

  executeFulfillment(){

    du.debug('Execute Fulfillment');

    let grouped_shipable_transaction_products = this.parameters.get('groupedshipabletransactionproducts');

    let compound_fulfillment_promises = objectutilities.map(grouped_shipable_transaction_products, fulfillment_provider => {

      let fulfillmentController = new FulfillmentController();
      let terminalReceiptController = new TerminalReceiptController();

      return fulfillmentController.execute({fulfillment_provider_id: fulfillment_provider, augmented_transaction_products: grouped_shipable_transaction_products[fulfillment_provider]})
      .then((vendor_response) => {

        return terminalReceiptController.issueReceipt({
          fulfillment_provider: fulfillment_provider,
          fulfillment_response: vendor_response,
          augmented_transaction_products: grouped_shipable_transaction_products[fulfillment_provider]
        }).then(shipping_receipt => {
          return {shipping_receipt, vendor_response};
        });

      });

    });

    return Promise.all(compound_fulfillment_promises).then(compound_fulfillment_promises => {

      this.parameters.set('compoundfulfillmentresponses', compound_fulfillment_promises);

      return true;

    });

  }

  transformTestResponse(){

    du.debug('Transform Test Response');

    let vendor_response = this.parameters.get('vendorresponse');

    let responsecode = 'fail';

    if(vendor_response.getCode() == 'success' && vendor_response.getMessage() == 'Success'){
      responsecode = 'success';
    }else if(vendor_response.getCode() == 'error'){
      responsecode = 'error';
    }

    this.parameters.set('responsecode', responsecode);

    return true;

  }

  transformCompoundFulfillmentResponses(){

    du.debug('Transform Compound Fulfillment Responses');

    let compound_fulfillment_responses = this.parameters.get('compoundfulfillmentresponses');

    let response = 'fail';

    let is_success = arrayutilities.every(compound_fulfillment_responses, compound_fulfillment_response => {
      return (compound_fulfillment_response.fulfillment_response.getCode() == 'success');
    });

    if(is_success){
      response = 'success'
    }

    let is_error = arrayutilities.find(compound_fulfillment_responses, compound_fulfillment_response => {
      return (compound_fulfillment_response.fulfillment_response.getCode() == 'error');
    });

    if(is_error){
      response = 'error';
    }

    this.parameters.set('responsecode', response);

    return true;

  }

  respond(){

    du.debug('Respond');

    let response_prototype = {
      response_type: this.parameters.get('responsecode')
    };

    let vendor_response = this.parameters.get('vendorresponse', null, false);

    if(!_.isNull(vendor_response) && _.isFunction(vendor_response.getParsedResponse)){
      response_prototype.vendor_response = vendor_response.getParsedResponse();
    }

    return new TerminalResponse(response_prototype);

  }

  acquireShippingReceipt(){

    du.debug('Acquire Shipping Receipt');

    let shipping_receipt = this.parameters.get('shippingreceipt');

    return this.shippingReceiptController.get({id: shipping_receipt.id}).then(shipping_receipt => {

      this.parameters.set('shippingreceipt', shipping_receipt);

      return true;

    });

  }

  acquireFulfillmentProvider(){

    du.debug('Acquire Shipping Receipt');

    let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

    return this.fulfillmentProviderController.get({id: fulfillment_provider_id}).then(fulfillment_provider => {

      this.parameters.set('fulfillmentprovider', fulfillment_provider);

      return true;

    });

  }

}
