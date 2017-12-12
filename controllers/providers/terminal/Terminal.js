'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const FulfillmentController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
const TerminalReceiptController = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');

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
      instantiatedfulfillmentprovider: global.SixCRM.routes.path('model', 'providers/shipping/terminal/instantiatedfulfillmentprovider.json'),
      compoundfulfillmentresponses: global.SixCRM.routes.path('model', 'providers/shipping/terminal/compoundfulfillmentresponses.json'),
      responsecode: global.SixCRM.routes.path('model', 'providers/shipping/terminal/responsecode.json')
    };

    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    this.productController = global.SixCRM.routes.include('entities', 'Product.js');
    this.fulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');

    const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

    this.transactionHelperController = new TransactionHelperController();

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

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
    .then(() => this.executeFulfillment())
    .then(() => this.transformCompoundFulfillmentResponses())
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

  executeFulfillment(){

    du.debug('Execute Fulfillment');

    let grouped_shipable_transaction_products = this.parameters.get('groupedshipabletransactionproducts');

    let compound_fulfillment_promises = objectutilities.map(grouped_shipable_transaction_products, fulfillment_provider => {

      let fulfillmentController = new FulfillmentController();
      let terminalReceiptController = new TerminalReceiptController();

      return fulfillmentController.execute({fulfillment_provider_id: fulfillment_provider, augmented_transaction_products: grouped_shipable_transaction_products[fulfillment_provider]})
      .then((fulfillment_response) => {

        return terminalReceiptController.issueReceipt({
          fulfillment_provider: fulfillment_provider,
          fulfillment_response: fulfillment_response,
          augmented_transaction_products: grouped_shipable_transaction_products[fulfillment_provider]
        }).then(shipping_receipt => {
          return {shipping_receipt, fulfillment_response};
        });

      });

    });

    return Promise.all(compound_fulfillment_promises).then(compound_fulfillment_promises => {

      this.parameters.set('compoundfulfillmentresponses', compound_fulfillment_promises);

      return true;

    });

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

    let response_code = this.parameters.get('responsecode');

    let response_prototype = {
      response_type: response_code
    };

    let terminal_response = new TerminalResponse(response_prototype);

    return terminal_response;

  }

}
