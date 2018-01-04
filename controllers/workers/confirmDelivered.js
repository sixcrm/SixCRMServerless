'use strict';
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

class confirmDeliveredController extends workerController {

    constructor(){

      super();

      this.parameter_definition = {
        execute: {
          required: {
            message: 'message'
          },
          optional:{}
        }
      };

      this.parameter_validation = {
        'transactions': global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
        'shippedtransactionproducts': global.SixCRM.routes.path('model', 'workers/confirmDelivered/shippedtransactionproducts.json'),
        'shippingreceipts': global.SixCRM.routes.path('model', 'entities/components/shippingreceipts.json'),
        'productdeliveredstati':global.SixCRM.routes.path('model', 'workers/confirmDelivered/productdeliveredstati.json'),
        'rebilldeliveredstatus':global.SixCRM.routes.path('model', 'workers/confirmDelivered/rebilldeliveredstatus.json')
      };

      this.augmentParameters();

    }

    execute(message){

      du.debug('Execute');

      return this.preamble(message)
      .then(() => this.acquireTransactions())
      .then(() => this.acquireTransactionProducts())
      .then(() => this.acquireShippingReceipts())
      .then(() => this.acquireProductDeliveredStati())
      .then(() => this.setDeliveredStatus())
      .then(() => this.respond())
      .catch(error => {
        du.error(error);
        return super.respond('error', error.message);
      });

    }

    acquireTransactions(){

      du.debug('Acquire Transactions');

      let rebill = this.parameters.get('rebill');

      if(!_.has(this, 'rebillController')){
        this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
      }

      return this.rebillController.listTransactions(rebill)
      .then((result) => this.rebillController.getResult(result, 'transactions'))
      .then(transactions => {

        this.parameters.set('transactions', transactions);

        return true;

      });

    }

    acquireTransactionProducts(){

      du.debug('Acquire Transaction Products');

      let transactions = this.parameters.get('transactions');

      if(!_.has(this, 'transactionHelperController')){
        const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

        this.transactionHelperController = new TransactionHelperController();
      }

      let transaction_products = this.transactionHelperController.getTransactionProducts(transactions);

      this.parameters.set('shippedtransactionproducts', transaction_products);

      return Promise.resolve(true);

    }

    acquireShippingReceipts(){

      du.debug('Acquire Shipping Receipts');

      let transaction_products = this.parameters.get('shippedtransactionproducts');

      if(!_.has(this, 'shippingReceiptController')){
        this.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
      }

      let shipping_receipt_promises = arrayutilities.map(transaction_products, transaction_product => {
        return this.shippingReceiptController.get({id:transaction_product.shippingreceipt});
      });

      return Promise.all(shipping_receipt_promises).then(shipping_receipts => {

        this.parameters.set('shippingreceipts', shipping_receipts);

        return true;

      });

    }

    acquireProductDeliveredStati(){

      du.debug('Acquire Product Delivered Stati');

      let shipping_receipts = this.parameters.get('shippingreceipts');

      if(!_.has(this, 'shippingStatusController')){
        this.shippingStatusController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/ShippingStatus.js');
      }

      let delivered_stati = arrayutilities.map(shipping_receipts, (shipping_receipt) => {

        return this.shippingStatusController.isDelivered({shipping_provider: 'usps', shipping_receipt: shipping_receipt});

      });

      return Promise.all(delivered_stati).then(delivered_stati => {

        this.parameters.set('productdeliveredstati', delivered_stati);

        return true;

      });

    }

    setDeliveredStatus() {

      du.debug('Confirm Delivered');

      let delivered_stati = this.parameters.get('productdeliveredstati');

      let delivered = arrayutilities.every(delivered_stati, (delivered_status) => {
        return delivered_status;
      });

      this.parameters.set('rebilldeliveredstatus', delivered);

      return Promise.resolve(true);

    }

    respond(){

      du.debug('Respond');

      let delivered = this.parameters.get('rebilldeliveredstatus');

      let response_code = (delivered == true)?'success':'noaction';

      return super.respond(response_code);

    }

}

module.exports = new confirmDeliveredController();
