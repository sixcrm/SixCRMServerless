'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

const RegisterUtilities = global.SixCRM.routes.include('providers', 'register/RegisterUtilities.js');

module.exports = class Register extends RegisterUtilities {

  constructor(){

    super();

    this.processor_response_map = {
      success:'success',
      declined:'fail',
      error:'error'
    };

    this.transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
    this.merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

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
      },
      process:{
        required:{
          rebill: 'rebill'
        },
        optional:{
        }
      }
    };

    this.parameter_validation = {
      'processorresponse': global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
      'transaction': global.SixCRM.routes.path('model', 'functional/register/transactioninput.json'),
      'receipttransaction': global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'associatedtransaction':global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'associated_transactions':global.SixCRM.routes.path('model', 'functional/register/associatedtransactions.json'),
      'amount':global.SixCRM.routes.path('model', 'definitions/currency.json'),
      'customer':global.SixCRM.routes.path('model', 'entities/customer.json'),
      'productschedule':global.SixCRM.routes.path('model', 'entities/productschedule.json'),
      'rebill':global.SixCRM.routes.path('model', 'entities/rebill.json'),
      'transactionproducts': global.SixCRM.routes.path('model', 'workers/processBilling/transactionproducts.json'),
      'productschedules':global.SixCRM.routes.path('model', 'workers/processBilling/productschedules.json'),
      'parentsession': global.SixCRM.routes.path('model', 'entities/session.json'),
      'creditcards': global.SixCRM.routes.path('model', 'workers/processBilling/creditcards.json'),
      'selectedcreditcard': global.SixCRM.routes.path('model', 'entities/creditcard.json'),
      'transactiontype':global.SixCRM.routes.path('model', 'functional/register/transactiontype.json'),
      'merchantprovider':global.SixCRM.routes.path('model', 'entities/merchantprovider.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

    this.action_to_transaction_type = {
      process: 'sale',
      refund: 'refund',
      reverse: 'reverse'
    }

    this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
    this.creditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

    this.merchantProviderController.sanitize(false);
    this.customerController.sanitize(false);
    this.creditCardController.sanitize(false);
  }

  refundTransaction(){

    du.debug('Refund Transaction');

    return this.can({action: 'refund', object: 'register', fatal: true})
    .then(() => this.setParameters({argumentation: arguments[0], action: 'refund'}))
    .then(() => this.hydrateTransaction())
    .then(() => this.getAssociatedTransactions())
    .then(() => this.setAmount())
    .then(() => this.validateAmount())
    .then(() => this.executeRefund())
    .then(() => this.issueReceipt())
    .then(() => this.acquireRefundTransactionSubProperties())
    .then(() => this.pushTransactionsRecordToRedshift())
    .then(() => this.transformResponse());

  }

  reverseTransaction(){

    du.debug('Reverse Transaction');

    return this.can({action: 'reverse', object: 'register', fatal: true})
    .then(() => this.setParameters({argumentation: arguments[0], action: 'refund'}))
    .then(() => this.hydrateTransaction())
    .then(() => this.getAssociatedTransactions())
    .then(() => this.validateAssociatedTransactions())
    .then(() => this.setAmount())
    .then(() => this.validateAmount())
    .then(() => this.executeReverse())
    .then(() => this.issueReceipt())
    .then(() => this.acquireRefundTransactionSubProperties())
    .then(() => this.pushTransactionsRecordToRedshift())
    .then(() => this.transformResponse());

  }

  processTransaction(){

    du.debug('Process Transaction');

    return this.can({action: 'process', object: 'register', fatal: true})
    .then(() => this.setParameters({argumentation: arguments[0], action: 'process'}))
    .then(() => this.acquireRebillProperties())
    .then(() => this.validateRebillForProcessing())
    .then(() => this.acquireRebillSubProperties())
    .then(() => this.executeProcesses())
    .then(() => this.transformResponse());

  }

  //Technical Debt:  Update such that only successful transactions are returned
  getAssociatedTransactions(){

    du.debug('Get Associated Transactions');

    let associated_transaction = this.parameters.get('associatedtransaction');

    return this.transactionController.listByAssociatedTransaction({id: associated_transaction, types:['reverse','refund'], results: ['success']})
    .then(associated_transactions => this.transactionController.getResult(associated_transactions, 'transactions'))
    .then(associated_transactions => {

      associated_transactions = (arrayutilities.nonEmpty(associated_transactions))?associated_transactions:[];

      return this.parameters.set('associated_transactions', associated_transactions);

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

      let associated_transaction = this.parameters.get('associatedtransaction');

      this.parameters.set('amount', associated_transaction.amount);

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
    let transaction = this.parameters.get('associatedtransaction');

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

    let transaction = this.parameters.get('associatedtransaction');
    let amount = this.parameters.get('amount');

    return refundController.refund({transaction: transaction, amount: amount}).then(result => {
      this.parameters.set('processorresponse', this.extractProcessorResponse(result));
      return true;
    });

  }

  executeReverse(){

    du.debug('Execute Reverse');

    const ReverseController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
    let reverseController = new ReverseController();

    let transaction = this.parameters.get('associatedtransaction');
    //let amount = this.parameters.get('amount');

    return reverseController.reverse({transaction: transaction}).then(result => {
      this.parameters.set('processorresponse', result);
      return true;
    });

  }

  issueReceipt(){

    du.debug('Issue Receipt');

    const RegisterReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
    let registerReceiptController = new RegisterReceiptController();

    let parameters = this.parameters.getAll();

    let argumentation_object = {
      amount: parameters.amount,
      transactiontype: parameters.transactiontype,
      processorresponse: parameters.processorresponse,
      merchant_provider: parameters.associatedtransaction.merchant_provider,
      transaction_products: parameters.associatedtransaction.products,
      associatedtransaction: parameters.associatedtransaction
    };

    return rebillController.get({id: parameters.associatedtransaction.rebill })
      .then(rebill => argumentation_object.rebill = rebill)
      .then(() => registerReceiptController.issueReceipt(argumentation_object))
      .then(receipt_transaction => this.parameters.set('receipttransaction', receipt_transaction));
  }

  pushTransactionsRecordToRedshift(){

    /*
    du.debug('Push Transactions Record');

    let transaction_redshift_obj = this.generateTransactionObject({});
    let product_schedules_redshift_obj = this.generateProductScheduleObjects();

    let promises = arrayutilities.map(product_schedules_redshift_obj, (schedule) => {
      return kinesisfirehoseutilities.putRecord('product_schedules', schedule);
    });

    promises.push(kinesisfirehoseutilities.putRecord('transactions', transaction_redshift_obj));

    return Promise.all(promises).then(() => true);
    */

  }

  transformResponse(){

    du.debug('Transform Response');

    let transaction_receipts = this.parameters.get('transactionreceipts');
    let processor_responses = this.parameters.get('processorresponses');
    let creditcard = this.parameters.get('selectedcreditcard');
    let response_category = this.getProcessorResponseCategory();

    let register_response = new RegisterResponse({
      transactions: transaction_receipts,
      processor_responses: processor_responses,
      response_type: response_category,
      creditcard: creditcard
    });

    du.info(register_response);

    return Promise.resolve(register_response);

  }

  getProcessorResponseCategory(){

    du.debug('Get Processor Response Category');

    let processor_responses = this.parameters.get('processorresponses');

    let successful = arrayutilities.find(processor_responses, processor_response => {
      return (_.has(processor_response, 'code') && processor_response.code == this.processor_response_map.success);
    });

    if(successful){
      return this.processor_response_map.success;
    }

    let error = arrayutilities.find(processor_responses, processor_response => {
      return (_.has(processor_response, 'code') && processor_response.code == this.processor_response_map.error);
    });

    if(error){
      return this.processor_response_map.error;
    }

    return this.processor_response_map.declined;

  }

  issueProductGroupReceipt({amount, processor_result, transaction_type, merchant_provider}){

    du.debug('Issue Product Group Receipt');

    const RegisterReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
    let registerReceiptController = new RegisterReceiptController();

    let rebill = this.parameters.get('rebill');
    let transaction_products = this.getTransactionProductsFromMerchantProviderGroup({merchant_provider: merchant_provider});

    let argumentation_object = {
      rebill: rebill,
      amount: amount,
      transactiontype: transaction_type,
      processorresponse: processor_result,
      merchant_provider: merchant_provider,
      transaction_products: transaction_products
    };

    return registerReceiptController.issueReceipt(argumentation_object);

  }

  getTransactionProductsFromMerchantProviderGroup({merchant_provider}){

    du.debug('getTransactionProductsFromMerchantProviderGroup');

    let merchant_provider_groups = this.parameters.get('merchantprovidergroups');

    let return_object = [];

    if(_.has(merchant_provider_groups, merchant_provider)){

      arrayutilities.map(merchant_provider_groups[merchant_provider], merchant_provider_group => {

        arrayutilities.map(merchant_provider_group, product_group => {
          return_object.push(product_group);
        });
      });

    }

    return return_object;

  }

  executeProcesses(){

    du.debug('Execute Processes');

    let merchant_provider_groups = this.parameters.get('merchantprovidergroups');

    let process_promises = objectutilities.map(merchant_provider_groups, merchant_provider => {

      let amount = this.calculateAmountFromProductGroups(merchant_provider_groups[merchant_provider]);

      return this.executeProcess({merchant_provider: merchant_provider, amount: amount});

    });

    return Promise.all(process_promises).then(() => {

      return true;

    });

  }

  executeProcess({merchant_provider: merchant_provider, amount: amount}){

    du.debug('Execute Process');

    let customer = this.parameters.get('customer');
    let creditcard = this.parameters.get('selectedcreditcard');

    return this.processMerchantProviderGroup({
      customer: customer,
      creditcard: creditcard,
      merchant_provider: merchant_provider,
      amount: amount
    }).then((processor_result) => {

      return this.issueProductGroupReceipt({
        amount: amount,
        processor_result: processor_result,
        transaction_type: 'sale',
        merchant_provider: merchant_provider
      }).then((transaction_receipt) => {

        this.parameters.push('transactionreceipts', transaction_receipt);

        return true;

      });

    });

  }

  processMerchantProviderGroup(){

    const ProcessController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
    let processController = new ProcessController();

    return processController.process(arguments[0]).then((result) => {

      return {
        code: result.getCode(),
        message: result.getMessage(),
        result: result.getResult(),
        merchant_provider: result.merchant_provider,
        creditcard: result.creditcard
      };

    }).then((result) => {

      this.parameters.push('processorresponses', result);

      return result;

    });

  }

  calculateAmountFromProductGroups(product_groups){

    du.debug('Calculate Amount From Product Groups');

    return arrayutilities.reduce(
      product_groups,
      (sum, product_group) => {

        let subtotal = arrayutilities.reduce(
          product_group,
          (subtotal, product) => {

            du.info(product);
            let product_group_total = numberutilities.formatFloat((product.amount * product.quantity), 2);

            return (subtotal + product_group_total);

          },
          0.0
        );

        return (sum + numberutilities.formatFloat(subtotal, 2));

      },
      0.0
    );

  }

  validateProcessorResponse(){

    du.debug('Validate Processor Response');
    //Technical Debt:  Flesh me out, possible JSON schema embellishment?

  }

  acquireRefundTransactionSubProperties() {

    return this.acquireRebill()
    .then(() => this.acquireRebillProperties())
    .then(() => this.acquireRebillSubProperties());

  }

  setParameters({argumentation, action}){

    du.debug('Set Parameters');

    this.parameters.setParameters({argumentation: argumentation, action: action});

    this.parameters.set('transactiontype', this.action_to_transaction_type[action]);

    return Promise.resolve(true);

  }

  generateTransactionObject({transaction_receipt, processor_response, merchant_provider, amount}){

    du.debug('Generate Transaction Object');

    let customer = this.parameters.get('customer');
    let session = this.parameters.get('session');

    transaction_receipt = (!_.isUndefined(transaction_receipt) && !_.isNull(transaction_receipt))?transaction_receipt:this.parameters.get('receipttransaction');
    processor_response = (!_.isUndefined(processor_response) && !_.isNull(processor_response))?this.parameters.get('processorresponse'):processor_response;
    merchant_provider = (!_.isUndefined(merchant_provider) && !_.isNull(merchant_provider))?this.parameters.get('merchantprovider'):merchant_provider;
    amount = (!_.isUndefined(amount) && !_.isNull(amount))?this.parameters.get('amount'):amount;

    let merchant_provider_id = (_.isObject(merchant_provider) && _.has(merchant_provider, 'id'))?merchant_provider.id:merchant_provider;

    let transaction_object = {
      id: transaction_receipt.id,
      datetime: transaction_receipt.created_at,
      customer: customer.id,
      creditcard: processor_response.creditcard.id,
      merchant_provider: merchant_provider_id,
      campaign: session.campaign,
      amount: amount,
      processor_result: processor_response.code,
      account: transaction_receipt.account,
      type: 'new',
      subtype: 'main'
    };

    if (!this.affiliateHelperController) {
      this.affiliateHelperController = new AffiliateHelperController();
    }

    return this.affiliateHelperController.transcribeAffiliates(session, transaction_object);

  }

  generateProductScheduleObjects(){

    du.debug('Generate Product Schedule Objects from Transaction Object');

    return arrayutilities.map(this.parameters.get('productschedules'), (schedule) => {
      return {
        product_schedule: schedule.id,
        transactions_id: this.parameters.get('receipttransaction').id,
        datetime: this.parameters.get('receipttransaction').created_at,
        customer: this.parameters.get('customer').id,
        creditcard: this.parameters.get('processorresponse').creditcard.id,
        merchant_provider: this.parameters.get('merchantprovider').id,
        campaign: this.parameters.get('parentsession').campaign,
        amount: this.parameters.get('amount'),
        processor_result: this.parameters.get('processorresponse').code,
        account: this.parameters.get('receipttransaction').account,
        type: 'new',
        subtype: 'main'
      }
    });

  }

  extractProcessorResponse(response) {

    du.debug('Extract Processor Response');

    if (objectutilities.hasRecursive(response, 'parameters.store')) {
      return objectutilities.clone(response.parameters.store);
    }

    return response;
  }

}
