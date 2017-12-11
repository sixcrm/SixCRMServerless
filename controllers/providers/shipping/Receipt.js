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
    this.transactionController = global.SixCRM.routes.include('entities', 'Transaction.js');

    this.parameter_definitions = {
      issueReceipt:{
        required:{
          fulfillmentprovider:'fulfillment_provider',
          fulfillmentproviderresponse: 'fulfillment_response',
          augmentedtransactionproducts: 'augmented_transaction_products'
        },
        optional:{
          trackingnumber:'tracking_number',
          trackingprovider:'tracking_provider'
        }
      }
    };

    this.parameter_validation = {};

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

  }

  issueReceipt({argumentation}){

    du.debug('Issue Receipt');

    this.parameters.setParameters({argumentation: argumentation, action: 'issueReceipt'});

    return this.createShippingReceiptPrototype()
    .then(() => this.createShippingReceipt())
    .then(() => this.associateShippingReceiptWithTransactionProducts())
    .then(() => {
      return this.parameters.get('shippingreceipt');
    });

  }

  createShippingReceiptPrototype(){

    du.debug('Create Shipping Receipt Prototype');

    let fulfillment_provider = this.parameters.get('fulfillmentprovider');
    let fulfillment_provider_response = this.parameters.get('fulfillmentproviderresponse');

    let prototype = {
      fulfillment_provider: fulfillment_provider,
      fulfillment_provider_response: fulfillment_provider_response,
  		status:"pending"
    };

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

    return true;

  }


}
