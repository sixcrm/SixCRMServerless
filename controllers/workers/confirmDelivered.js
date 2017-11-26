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
        'transactions':global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
        //Technical Debt:  We need a schema that enforces the transaction product having a shipping receipt...
        'transactionproducts':global.SixCRM.routes.path('model', 'entities/components/transactionproducts.json'),
        'shippingreceipts':global.SixCRM.routes.path('model', 'entities/components/shippingreceipts.json')
        //'deliveredstatus'
        //'shippingproviderstati':global.SixCRM.routes.path('model', 'workers/')
      };

      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

      const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entitites/transaction/Transaction.js');

      this.transactionHelperController = new TransactionHelperController();

      this.shippingStatusController = global.SixCRM.routes.include('controllers', 'vendors/shippingproviders/ShippingStatus.js');

      this.augmentParameters();

    }

    execute(event){

      du.debug('Execute');

      this.preamble()
      .then(() => this.acquireTransaction())
      .then(() => this.acquireTransactionProducts())
      .then(() => this.acquireShippingReceipts())
      .then(() => this.acquireShippingStati())
      .then(() => this.confirmDelivered())
      .then(() => this.respond())
      .catch(error => {
        return super.respond('error', error.message);
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

    acquireTransactionProducts(){

      du.debug('Acquire Transaction Products');

      let transactions = this.parameters.get('transactions');

      let transaction_products = this.transactionHelperController.getTransactionProducts(transactions);

      this.parameters.set('transactionproducts', transaction_products);

      return Promise.resolve(true);

    }

    acquireShippingReceipts(){

      du.debug('Acquire Shipping Receipts');

      let transaction_products = this.parameters.get('transactionproducts');

      let shipping_receipt_promises = arrayutilities.map(transaction_products, transaction_product => {
        return this.shippingReceiptController.get({id:transaction_product.shippingreceipt});
      });

      return Promise.all(shipping_receipt_promises).then(shipping_receipts => {

        this.parameters.set('shippingreceipts', shipping_receipts);

        return true;

      });

    }

    //Note:  Good place to update the shipping status and history on the receipt.
    acquireShippingStati(){

      du.debug('Acquire Shipping Stati');

      let shipping_receipts = this.parameters.get('shippingreceipts');

      let shipping_provider_stati = arrayutilities.map(shipping_receipts, (shipping_receipt) => {

        return this.shippingStatusController.getStatus('usps', shipping_receipt.trackingnumber);

      });

      return Promise.all(shipping_provider_stati).then((shipping_provider_stati) => {

        this.parameters.set('shippingproviderstati', shipping_provider_stati);

        return true;

      });

    }

    setDeliveredStatus() {

      du.debug('Confirm Delivered');

      let shipping_provider_stati = this.parameters.get('shippingproviderstati');

      let delivered = arrayutilities.every(shipping_provider_stati, (shipping_provider_status) => {

        //Technical Debt:  Configure
        return (shipping_provider_status.parsed_status == 'DELIVERED');

      });

      this.parameters.set('deliveredstatus', delivered);

      return Promise.resolve(true);

    }

    respond(){

      du.debug('Respond');

      let delivered = this.parameters.get('deliveredstatus');

      let response_code = (delivered == true)?'success':'noaction';

      return super.respond(response_code);

    }

}

module.exports = new confirmDeliveredController();
