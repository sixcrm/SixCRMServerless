'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

module.exports = class TerminalController {

  constructor(){

    //super();

    this.parameter_definition = {
      shipRebill:{
        required: {
          rebill: 'rebill'
        },
        optional:{

        }
      }
    };

    this.parameter_validation = {
      rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
      transactions: global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
      transactionproducts: global.SixCRM.routes.path('model', 'entities/components/transactionproducts.json'),
      products: global.SixCRM.routes.path('model', 'entities/components/products.json')
    };

    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    this.productController = global.SixCRM.routes.include('entities', 'Product.js');

    /*
    var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
    var shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');
    var fulfillmentTriggerController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');
    */

    const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

    this.transactionHelperController = new TransactionHelperController();

    this.augmentParameters();

    /*
      this.messages = {
          notified: 'NOTIFIED',
          noship: 'NOSHIP',
          failed: 'FAILED'
      };
    */

  }

  shipRebill({rebill}){

    du.debug('Execute');

    return Promise.resolve(true);

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
