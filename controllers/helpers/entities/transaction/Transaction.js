'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class TransactionHelperController {

  constructor(){

  }

  getTransactionProducts(transactions){

    du.debug('Get Transaction Products');

    let transaction_products = [];

    arrayutilities.map(transactions, transaction => {
      if(_.has(transaction, 'products')){
        arrayutilities.map(transaction.products, transaction_product => {
          transaction_products.push(transaction_product);
        });
      }
    });

    return transaction_products;

  }

}
