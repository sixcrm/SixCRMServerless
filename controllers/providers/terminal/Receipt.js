'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class TerminalRecieptGenerator {

  constructor(){

    this.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
    this.fulfillmentProviderController =  global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');

    const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

    this.transactionHelperController = new TransactionHelperController();

    this.parameter_definitions = {
      issueReceipt:{
        required:{
          fulfillmentproviderid:'fulfillment_provider_id',
          augmentedtransactionproducts: 'augmented_transaction_products',
          fulfillmentproviderreference: 'fulfillment_provider_reference'
        },
        optional:{
          trackingnumber:'tracking_number',
        }
      }
    };

    this.parameter_validation = {
      'fulfillmentproviderid':global.SixCRM.routes.path('model', 'definitions/uuidv4.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

  }

  issueReceipt(){

    du.debug('Issue Receipt');

    du.info(arguments[0]);
    this.parameters.setParameters({argumentation: arguments[0], action: 'issueReceipt'});

    return this.hydrateProperties()
    .then(() => this.createShippingReceiptPrototype())
    .then(() => this.createShippingReceipt())
    .then(() => this.associateShippingReceiptWithTransactionProducts())
    .then(() => {
      return this.parameters.get('shippingreceipt');
    });

  }

  hydrateProperties(){

    du.debug('Hydrate Properties');

    let hydration_promises = [
      this.getAccount()
    ];

    return Promise.all(hydration_promises).then(result => {
      return true;
    });

  }

  getAccount(){

    du.debug('Get Account');

    let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

    return this.fulfillmentProviderController.get({id: fulfillment_provider_id }).then(result => {

      this.parameters.set('fulfillmentprovider', result);

      this.parameters.set('account', result.account);

      return true;

    });

  }

  createShippingReceiptPrototype(){

    du.debug('Create Shipping Receipt Prototype');

    let account = this.parameters.get('account');
    let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');
    let fulfillment_provider_reference = this.parameters.get('fulfillmentproviderreference', null, false);
    let tracking_number = this.parameters.get('trackingnumber', null, false);

    let prototype = {
      account: account,
      fulfillment_provider: fulfillment_provider_id,
  		status: 'pending',
      history: [
        {
          created_at: timestamp.getISO8601(),
          status:'pending',
          detail: 'Fulfillment Provider notified.'
        }
      ]
    };

    if(!_.isNull(fulfillment_provider_reference)){
      prototype.fulfillment_provider_reference = fulfillment_provider_reference;
    }

    if(!_.isNull(tracking_number)){
      prototype.tracking_number = tracking_number;
    }

    this.parameters.set('shippingreceiptprototype', prototype);

    return true;

  }

  createShippingReceipt(){

    du.debug('Create Shipping Receipt');

    let shipping_receipt_prototype = this.parameters.get('shippingreceiptprototype');

    return this.shippingReceiptController.create({entity: shipping_receipt_prototype}).then(shipping_receipt => {
      this.parameters.set('shippingreceipt', shipping_receipt);
      return true;
    });

  }

  associateShippingReceiptWithTransactionProducts(){

    du.debug('Associate Shipping Receipt With Transaction Products');

    let shipping_receipt = this.parameters.get('shippingreceipt');
    let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

    let grouped_augmented_transaction_products = this.groupAugmentedTransactionProducts(augmented_transaction_products);

    let transaction_update_promises = objectutilities.map(grouped_augmented_transaction_products, transaction_id => {

      let updated_transaction_products = this.updateTransactionProducts(grouped_augmented_transaction_products[transaction_id]);

      return () => this.transactionHelperController.updateTransactionProducts({transaction_id: transaction_id, updated_transaction_products: updated_transaction_products});

    });

    return arrayutilities.serial(transaction_update_promises).then((results) => {
      //du.info(results);
      return true;
    });

  }

  groupAugmentedTransactionProducts(augmented_transaction_products){

    du.debug('groupAugmentedTransactionProductsByTransactionID');

    return arrayutilities.group(augmented_transaction_products, (augmented_transaction_product) => {
      return augmented_transaction_product.transaction.id;
    });

  }

  updateTransactionProducts(augmented_transaction_products){

    du.debug('Update Transaction Products');

    let shipping_receipt = this.parameters.get('shippingreceipt');

    return arrayutilities.map(augmented_transaction_products, transaction_product => {
      return {
        product: transaction_product.product,
        shipping_receipt: shipping_receipt.id,
        amount: transaction_product.amount
      }
    });

  }

}
