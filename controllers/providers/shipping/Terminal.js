'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const FulfillmentController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
const TerminalResponse = global.SixCRM.routes.include('providers', 'shipping/Response.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class TerminalController extends PermissionedController  {

  constructor(){

    super();

    this.parameter_definition = {
      shipRebill:{
        required: {
          rebill: 'rebill'
        },
        optional:{}
      },
      fulfill:{
        required: {
          selecedfulfillmentproviderid:'fulfillment_provider_id',
          selectedaugmentedtransactionproducts:'augmented_transaction_products'
        },
        optional:{

        }
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
      instantiatedfulfillmentprovider: global.SixCRM.routes.path('model', 'providers/shipping/terminal/instantiatedfulfillmentprovider.json')
    };

    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    this.productController = global.SixCRM.routes.include('entities', 'Product.js');
    this.fulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');

    const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

    this.transactionHelperController = new TransactionHelperController();

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

  }

  shipRebill({rebill}){

    du.debug('Execute');

    return Promise.resolve(true)
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'shipRebill'}))
    .then(() => this.acquireRebill())
    .then(() => this.acquireTransactions())
    .then(() => this.setAugmentedTransactionProducts())
    .then(() => this.acquireProducts())
    .then(() => this.getShipableProductIDs())
    .then(() => this.createShipableTransactionProductGroup())
    .then(() => this.groupShipableTransactionProductGroupByFulfillmentProvider())
    .then(() => this.hydrateFulfillmentProviders())
    .then(() => this.executeFulfillment())
    .then(() => this.respond());

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let rebill =  this.parameters.get('rebill');

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

    let productids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
      return augmented_transaction_product.product;
    });

    productids = arrayutilities.unique(productids);

    return this.productController.list(productids).then(products => {
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

  //Tested To Here...
  executeFulfillment(){

    du.debug('Execute Fulfillment');

    let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');
    let grouped_shipable_transaction_products = this.parameters.get('groupedshipabletransactionproducts');

    let fulfillment_promises = objectutilities.map(grouped_shipable_transaction_products, fulfillment_provider => {

      let fulfillmentController = new FulfillmentController();

      return fulfillmentController.execute({fulfillment_provider_id: fulfillment_provider_id, augmented_transaction_products: grouped_shipable_transaction_products[fulfillment_provider_id]});

    });

    //Technical Debt:  These need to execute serially
    return Promise.all(fulfillment_promises).then(fulfillment_promises => {

      this.parameters.set('fulfillmentresponses', fulfillment_promises);

      return true;

    });

  }

  transformFulfillmentResponse(){

    du.debug('Transform Fulfillment Response');

    let fulfillment_responses = this.parameters.get('fulfillmentresponses');

    let response = 'fail';

    let is_success = arrayutilities.every(fulfillment_responses, fulfillment_response => (fulfillment_response.getCode() == 'success'));

    if(is_success){
      response = 'success'
    }

    let is_error = arrayutilities.find(fulfillment_responses, fulfillment_response => (fulfillment_response.getCode() == 'error'));

    if(is_error){
      response = 'error';
    }

    this.parameters.set('responsecode', response);

    return true;

  }

  respond(){

    du.debug('Respond');

    let responsecode = this.parameters.get('responsecode');

    let response_prototype = {}

    let terminal_response = new TerminalResponse(response_prototype);

    return Promise.resolve(terminal_response);

  }

}
