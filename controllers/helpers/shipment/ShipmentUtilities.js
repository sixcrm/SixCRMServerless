'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class ShipmentUtilities {

  constructor(){

    this.fulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');
    this.productController = global.SixCRM.routes.include('entities', 'Product.js');
    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');

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

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

  }

  augmentParameters(){

    du.debug('Augment Parameters');

    this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
    this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

    return true;

  }

  instantiateFulfillmentProviderClass(){

    du.debug('Instantiate Fulfillment Provider Class');

    let fulfillment_provider = this.parameters.get('fulfillmentprovider');

    const FulfillmentController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/'+fulfillment_provider.provider+'/handler.js');

    let fulfillmentController = new FulfillmentController({fulfillment_provider: fulfillment_provider});

    this.parameters.set('instantiatedfulfillmentprovider', fulfillmentController);

    return true;

  }

  //Technical Debt:  Serial Promise Execution necessary
  markTransactionProductsWithShippingReceipt(){

    du.debug('Mark Transaction Products With Shipping Receipt');

    let shipping_receipt = this.parameters.get('shippingreceipt');
    let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

    let update_promises = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {

      let updated_transaction_product = objectutilities.transcribe({product: 'product', amount: 'amount'}, augmented_transaction_product, {}, true);

      updated_transaction_product = objectutilities.transcribe({no_ship: 'no_ship'}, augmented_transaction_product, updated_transaction_product);
      updated_transaction_product.shipping_receipt = shipping_receipt.id;

      return this.transactionHelperController.updateTransactionProduct({id: augmented_transaction_product.transaction.id, transaction_product: updated_transaction_product}).then(result => {
        //Note:  This is a transaction
        return result;
      });

    });

    //Technical Debt:  This needs to occur serially
    return Promise.all(update_promises).then(update_promises => {
      //Note:  update_promises is a array of transactions
      return true;
    });

  }

  //Needs testing
  issueReceipts(){

    du.debug('Issue Receipts');

    const FulfillmentReceiptController = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
    let fulfillmentReceiptController = new FulfillmentReceiptController();

    return fulfillmentReceiptController.issueReceipt(this.parameters.getAll()).then(shipping_receipt => {
      this.parameters.set('shippingreceipt', shipping_receipt);
      return true;
    });

  }

  hydrateFulfillmentProvider(){

    du.debug('Hydrate Fulfillment Provider');

    let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

    return this.fulfillmentProviderController.get({id: fulfillment_provider_id}).then(fulfillment_provider => {

      this.parameters.set('fulfillmentprovider', fulfillment_provider);

      return true;

    });

  }

  hydrateProducts(){

    du.debug('Hydrate Products');

    let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

    let product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => augmented_transaction_product.product);

    product_ids = arrayutilities.unique(product_ids);

    return this.productController.getListByAccount({ids: product_ids}).then(products => {

      this.parameters.set('products', products);

      return true;

    });

  }

  acquireCustomer(){

    du.debug('Acquire Customer');

    return Promise.resolve()
    .then(() => this.acquireRebillFromTransactions())
    .then(() => this.acquireSessionFromRebill())
    .then(() => this.acquireCustomerFromSession());

  }

  acquireRebillFromTransactions(){

    du.debug('Acquire Rebill From Transactions');

    let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

    let rebill_ids = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product) => augmented_transaction_product.transaction.rebill);

    rebill_ids = arrayutilities.unique(rebill_ids);

    if(!arrayutilities.nonEmpty(rebill_ids)){
      eu.throwError('server', 'Unable to establish rebill ID.');
    }

    if(rebill_ids.length > 1){
      eu.throwError('server', 'Non-distinct rebill ID.');
    }

    this.parameters.set('rebillid', rebill_ids[0]);

    return this.acquireRebill();

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let rebill_id = this.parameters.get('rebillid');

    return this.rebillController.get({id: rebill_id}).then((rebill) => {

      this.parameters.set('rebill', rebill);

      return true;

    });

  }

  acquireSessionFromRebill(){

    du.debug('Acquire Session From Rebill');

    let rebill = this.parameters.get('rebill');

    return this.rebillController.getSession(rebill).then(session => {

      this.parameters.set('session', session);

      return true;

    });

  }

  acquireCustomerFromSession(){

    du.debug('Acquire Session From Rebill');

    let session = this.parameters.get('session');

    return this.sessionController.getCustomer(session).then(customer => {

      this.parameters.set('customer', customer);

      return true;

    });

  }

  marryProductsToAugmentedTransactionProducts(){

    du.debug('Marry Products To Augmented Transaction Products');

    let products = this.parameters.get('products');
    let augmented_transaction_products =  this.parameters.get('augmentedtransactionproducts');

    let hydrated_augmented_transaction_products = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product, index) => {

      let hydrated_product = arrayutilities.find(products, (product) => {
        return (product.id == augmented_transaction_product.product);
      });

      augmented_transaction_product.product = hydrated_product;

      return augmented_transaction_product;

    });

    this.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);

    return true;

  }

}
