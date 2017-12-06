'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
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
    //here...
    .then(() => this.ship())
    .then(() => this.updateTransactions())
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

  hydrateFulfillmentProviders(){

    du.debug('Hydrate Fulfilment Providers');

    let products = this.parameters.get('products');

    let fulfillment_provider_ids = arrayutilities.map(products, product => product.fulfillment_provider);

    fulfillment_provider_ids = arrayutilities.unique(fulfillment_provider_ids);

    return this.fulfillmentProviderController.list(fulfillment_provider_ids).then(fulfillment_providers => {

      this.parameters.set('fulfillmentproviders', fulfillment_providers);

      return true;

    });

  }

  ship(){

    du.debug('Ship');

    let grouped_shipable_transaction_products = this.parameters.get('groupedshipabletransactionproducts');

    let fulfillment_promises = objectutilities.map(grouped_shipable_transaction_products, fulfillment_provider => {

      let fulfillmentProviderClass = this.instantiateFulfillmentProviderClass(fulfillment_provider);

      return fulfillmentProviderClass.fulfill(grouped_shipable_transaction_products[fulfillment_provider]);

    });

    return Promise.all(fulfillment_promises).then(fulfillment_promises => {

      this.parameters.set('fulfillmentresponses', fulfillment_promises);

      return true;

    });

  }

  /*
  hydrateRebillProperties(){

    du.debug('Hydrate Rebill Properties');

    let rebill = this.parameters.get('rebill');

    return this.rebillController.listTransactions(rebill).then((transactions) => {
      this.parameters.set('transactions', transactions);
      return true;
    });

  }

  processTransactions(){

    du.debug('Process Transactions');

    let transactions = this.parameters.get('transactions');

    let transaction_processing_promises = arrayutilities.map(transactions, (transaction) => {

      return this.processTransaction(transaction);

    });

    return Promise.all(transaction_processing_promises).then(transaction_processing_promises => {

      let response = 'success';

      arrayutilities.map(transaction_processing_promises,(processed_transaction) => {
        if(processed_transaction.getCode() != 'success'){
          response = processed_transaction;
        }
      });

      return response;

    });

  }

  processTransaction(transaction){

    du.debug('Process Transaction');

    let transaction_products = this.transactionHelperController.getTransactionProducts([transaction]);

    let fulfillment_promises = arrayutilities.map(transaction_products, transaction_product => {
      if(this.shouldShip(transaction_product)){
        return this.executeFulfillment(transaction_product, transaction);
      }
    });

    fulfillment_promises = arrayutilities.filter(fulfillment_promises, fulfillment_promise => {
      return (!_.isNull(fulfillment_promise));
    });

    if(fulfillment_triggers.length > 0){

      return Promise.all(fulfillment_promises).then((fulfillment_promises) => {

      });

    }

    return Promise.all(fulfillment_promises)
    .then((fulfillment_promises) => {

      let all_shipped = arrayutilities.every(fulfillment_promises, fulfillment_promise => {
        return (fullfillment_promise.getCode() == 'success');
      });

      if(all_shipped){
        return 'success;'
      }

      return 'fail';

    });

  }


  // Technical Debt: Unused fulfillment response. I assume it's to be used in the receipt.
  issueShippingReceipt(fulfillment_response, transaction_product, transaction){
      return new Promise((resolve, reject) => {

          var promises = []

          promises.push(transactionController.get({id: transaction.id}));
          promises.push(shippingReceiptController.create({entity: shippingReceiptController.createShippingReceiptObject({status:'pending'})}));

          Promise.all(promises).then((promises) => {

              var raw_transaction = promises[0];
              var new_shipping_receipt = promises[1];

              var found = false;

              for(var i=0; i< raw_transaction.products.length; i++){

                  if(!_.has(raw_transaction.products[i], 'shippingreceipt')){

                      if(raw_transaction.products[i].product == transaction_product.product.id && raw_transaction.products[i].amount == transaction_product.amount){

                          found = true;

                          raw_transaction.products[i].shippingreceipt = new_shipping_receipt.id;

                          return transactionController.update({entity: raw_transaction}).then((updated_transaction) => {

                              return updated_transaction

                          });

                      }

                  }

              }

              if(found == false){
                  eu.throwError('not_found','Unable to re-acquire transaction');
              }

          }).then((updated_transaction) => {
              resolve(updated_transaction);
          }).catch((error) => {
              reject(error);
          });

      });

  }

  executeFulfillment(transaction_product, transaction){

      return new Promise((resolve, reject) => {

          if(this.shouldShip(transaction_product)){

              if(!_.has(transaction_product, 'shippingreceipt')){

                  fulfillmentTriggerController.triggerFulfillment(transaction_product).then((fulfillment_response) => {

                      switch(fulfillment_response){

                      case this.messages.notified:

                          this.issueShippingReceipt(fulfillment_response, transaction_product, transaction).then(() => {

                              resolve(this.messages.notified);

                          });

                          break;

                      case this.messages.failed:

                          resolve(this.messages.failed);
                          break;

                      default:

                          resolve(fulfillment_response);
                          break;

                      }

                  });

              }else{

                  resolve(this.messages.notified);

              }

          }else{

              resolve(this.messages.noship);

          }

      });

  }

  shouldShip(transaction_product) {

    return transaction_product.product.ship === 'true' || transaction_product.product.ship === true;

  }
  */

}
