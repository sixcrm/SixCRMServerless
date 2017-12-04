'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class TransactionHelperController {

  constructor(){

    this.parameter_definition = {
      markTransactionChargeback: {
        required: {
          transactionid:'transactionid',
          chargebackstatus: 'chargeback_status'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'transactionid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
      'transaction': global.SixCRM.routes.path('model','entities/transaction.json'),
      'chargebackstatus': global.SixCRM.routes.path('model','helpers/transaction/chargeback.json')
    };

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    this.transactionController = global.SixCRM.routes.include('entities', 'Transaction.js');

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

  markTransactionChargeback({transactionid, chargeback_status}){

    du.warning(arguments[0]);

    du.debug('Mark Transaction Chargeback');

    return Promise.resolve(true)
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'markTransactionChargeback'}))
    .then(() => this.acquireTransaction())
    .then(() => this.setChargebackStatus())
    .then(() => this.updateTransaction())
    .then(() => {
      return this.parameters.get('transaction');
    })

  }

  acquireTransaction(){

    du.debug('Acquire Transaction');

    let transaction_id = this.parameters.get('transactionid');

    return this.transactionController.get({id: transaction_id}).then(transaction => {
      if(_.isNull(transaction)){ eu.throwError('notfound', 'Transaction not found.'); }
      this.parameters.set('transaction', transaction);
      return true;
    });

  }

  setChargebackStatus(){

    du.debug('Set Chargeback Status');

    let chargeback_status = this.parameters.get('chargebackstatus');
    let transaction = this.parameters.get('transaction');

    transaction.chargeback = chargeback_status;

    this.parameters.set('transaction', transaction);

    return true;

  }

  updateTransaction(){

    du.debug('Update Transaction');

    let transaction = this.parameters.get('transaction');

    return this.transactionController.update({entity: transaction}).then(transaction => {
      this.parameters.set('transaction', transaction);
      return true;
    });

  }

}
