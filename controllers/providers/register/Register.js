'use strict'
const _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

//Technical Debt:  MVU does not want to load schemas from the entities directory
module.exports = class Register extends PermissionedController {

  constructor(){

    super();

    this.transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

    this.parameter_definitions = {
      refund: {
        required: {
          transaction: 'transaction'
        },
        optional: {
          amount: 'amount'
        }
      },
      reverse:{
        required: {
          transaction: 'transaction'
        },
        optional: {}
      }
      //Technical Debt: Add process
    };

    this.parameter_validation = {
      //Technical Debt:  This does not want to import ../../entities/transaction.json for some reason...
      'processor_response': global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
      'transaction': global.SixCRM.routes.path('model', 'functional/register/transactioninput.json'),
      'hydrated_transaction':global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'associated_transactions':global.SixCRM.routes.path('model', 'functional/register/associatedtransactions.json'),
      'amount':global.SixCRM.routes.path('model', 'definitions/currency.json')
    }

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

  }

  refundTransaction({transaction, amount}){

    du.debug('Refund Transaction');

    return this.can({action: 'refund', object: 'register', fatal: true})
    .then(() => this.setParameters({argumentation: arguments[0], action: 'refund'}))
    .then(() => this.hydrateTransaction())
    .then(() => this.getAssociatedTransactions())
    .then(() => this.setAmount())
    .then(() => this.validateAmount())
    .then(() => this.executeRefund())
    .then(() => this.createTransaction())
    //Technical Debt:  Add a event that corresponds to what just happened.
    .then(() => this.transformResponse());

  }

  setParameters({argumentation, action}){

    du.debug('Set Parameters');

    this.parameters.setParameters({argumentation: argumentation, action: action});

    this.parameters.set('transaction_type', action);

    return Promise.resolve(true);

  }

  reverseTransaction({transaction}){

    du.debug('Reverse Transaction');

    return this.can({action: 'reverse', object: 'register', fatal: true})
    .then(() => this.setParameters({argumentation: arguments[0], action: 'refund'}))
    .then(() => this.hydrateTransaction())
    .then(() => this.getAssociatedTransactions())
    .then(() => this.validateAssociatedTransactions())
    .then(() => this.setAmount())
    .then(() => this.validateAmount())
    .then(() => this.executeReverse())
    .then(() => this.createTransaction())
    //Technical Debt:  Add a event that corresponds to what just happened.
    .then(() => this.transformResponse());

  }

  hydrateTransaction(){

    du.debug('Hydrate Transaction');

    let transaction = this.parameters.get('transaction');

    return this.transactionController.get({id: transaction, fatal: true}).then(transaction => {

      this.parameters.set('hydrated_transaction', transaction);

      return transaction;

    })

  }

  getAssociatedTransactions(){

    du.debug('Get Associated Transactions');

    let hydrated_transaction = this.parameters.get('hydrated_transaction');

    return this.transactionController.listByAssociatedTransaction({id: hydrated_transaction, types:['reverse','refund']})
    .then(associated_transactions => this.transactionController.getResult(associated_transactions, 'transactions'))
    .then(associated_transactions => {

      associated_transactions = (arrayutilities.nonEmpty(associated_transactions))?associated_transactions:[];

      this.parameters.set('associated_transactions', associated_transactions);

    });

  }

  validateAssociatedTransactions(){

    du.debug('Validate Associated Transactions');

    let associated_transactions = this.parameters.get('associated_transactions', null, false);

    if(arrayutilities.nonEmpty(associated_transactions)){
      eu.throwError('forbidden', 'A transaction with pre-existing refunds or reversals can not be reversed.');
    }

    return Promise.resolve(true);

  }

  setAmount(){

    du.debug('Set Amount');

    let amount  = this.parameters.get('amount', null, false);

    if(_.isNull(amount) || _.isUndefined(amount)){

      let hydrated_transaction = this.parameters.get('hydrated_transaction');

      this.parameters.set('amount', hydrated_transaction.amount);

    }

    return Promise.resolve(true);

  }

  //Note:  This is te (???)
  calculateReversedAmount(associated_transactions){

    du.debug('Calculate Resolved Amount');

    let base = 0;

    if(arrayutilities.nonEmpty(associated_transactions)){

      let associated_transaction_amounts = arrayutilities.map(associated_transactions, associated_transaction => {
        return associated_transaction.amount;
      });

      base += mathutilities.sum(associated_transaction_amounts);

    }

    return base;

  }

  validateAmount(){

    du.debug('Validate Amount');

    //This is the original transaction with the maximum amount
    let transaction = this.parameters.get('hydrated_transaction');

    //This is the amount that we are proposing to reverse
    let amount = this.parameters.get('amount');

    //These are all of the existing transactions which are of type reverse or refund and thus have negative value.
    let associated_transactions = this.parameters.get('associated_transactions', null, false);

    //This is the total, preexisting reversed amount
    let resolved_amount = this.calculateReversedAmount(associated_transactions);

    //This is the remaining positive balance associated with the transaction
    let balance = (transaction.amount - resolved_amount);

    //If the proposed amount is greater than positive balance, we have a problem
    if(amount > balance){
      eu.throwError('forbidden', 'The proposed resolved transaction amount is negative.');
    }

    return Promise.resolve(true);

  }

  executeRefund(){

    du.debug('Execute Refund');

    const RefundController = global.SixCRM.routes.include('helpers', 'transaction/Refund.js');
    let refundController = new RefundController();

    let transaction = this.parameters.get('hydrated_transaction');
    let amount = this.parameters.get('amount');

    return refundController.refund({transaction: transaction, amount: amount}).then(result => {
      this.parameters.set('processor_response', result);
      return true;
    });

  }

  executeReverse(){

    du.debug('Execute Reverse');

    const ReverseController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
    let reverseController = new ReverseController();

    let transaction = this.parameters.get('hydrated_transaction');
    //let amount = this.parameters.get('amount');

    return reverseController.reverse({transaction: transaction}).then(result => {
      this.parameters.set('processor_response', result);
      return true;
    });

  }

  createTransaction(){

    du.debug('Create Transaction');

    let processor_response = this.parameters.get('processor_response');

    if(processor_response.code === 'success'){

      let hydrated_transaction = this.parameters.get('hydrated_transaction');
      let amount = this.parameters.get('amount');
      let transaction_type = this.parameters.get('transaction_type');

      let transaction_prototype = {
        rebill: hydrated_transaction.rebill,
        amount: amount,
        products: hydrated_transaction.products,
        merchant_provider: hydrated_transaction.merchant_provider,
        type: transaction_type,
        associated_transaction: hydrated_transaction.id
      };

      transaction_prototype = this.transactionController.createTransactionObject(transaction_prototype, processor_response);

      return this.transactionController.create({entity: transaction_prototype}).then(result_transaction => {
        this.parameters.set('result_transaction', result_transaction);
      });

    }

    return Promise.resolve(null);

  }

  transformResponse(){

    du.debug('Transform Response');

    let refund_transaction = this.parameters.get('result_transaction', null, false);

    let processor_response = this.parameters.get('processor_response');

    return {transaction: refund_transaction, processor_response: processor_response};

  }


  processTransaction({customer, blah}){

  }

}
