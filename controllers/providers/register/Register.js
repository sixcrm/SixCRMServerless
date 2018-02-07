'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities');

const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');

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
    .then(() => this.issueReceipt())
    .then(() => this.acquireRefundTransactionSubProperties())
    .then(() => this.pushTransactionsRecordToRedshift())
    .then(() => this.transformResponse());

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
    .then(() => this.issueReceipt())
    .then(() => this.acquireRefundTransactionSubProperties())
    .then(() => this.pushTransactionsRecordToRedshift())
    .then(() => this.transformResponse());

  }

  processTransaction({rebill}){

    du.debug('Process Transaction');

    return this.can({action: 'process', object: 'register', fatal: true})
    .then(() => this.setParameters({argumentation: arguments[0], action: 'process'}))
    .then(() => this.setDependencies('process'))
    .then(() => this.acquireRebillProperties())
    .then(() => this.validateRebillForProcessing())
    .then(() => this.acquireRebillSubProperties())
    .then(() => this.calculateAmount())
    .then(() => this.executeProcess())
    .then(() => this.executePostProcess())
    .then(() => this.issueReceipt())
    .then(() => this.pushTransactionsRecordToRedshift())
    .then(() => this.transformResponse());

  }

  hydrateTransaction(){

    du.debug('Hydrate Transaction');

    let transaction = this.parameters.get('transaction');

    return this.transactionController.get({id: transaction, fatal: true}).then(transaction => {

      this.parameters.set('associatedtransaction', transaction);

      return transaction;

    })

  }

  //Technical Debt:  Update such that only successful transactions are returned
  getAssociatedTransactions(){

    du.debug('Get Associated Transactions');

    let associated_transaction = this.parameters.get('associatedtransaction');

    return this.transactionController.listByAssociatedTransaction({id: associated_transaction, types:['reverse','refund'], results: ['success']})
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
      this.parameters.set('processorresponse', result);
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

    //Technical Debt: fix this
    return registerReceiptController.issueReceipt({argumentation: this.parameters.getAll()}).then(receipt_transaction => {
      this.parameters.set('receipttransaction', receipt_transaction);
    });

  }

  pushTransactionsRecordToRedshift(){

    du.debug('Push Transactions Record');

    let transaction_redshift_obj = this.generateTransactionObject();
    let product_schedules_redshift_obj = this.generateProductScheduleObjects();

    let promises = arrayutilities.map(product_schedules_redshift_obj, (schedule) => {
      return kinesisfirehoseutilities.putRecord('product_schedules', schedule);
    });

    promises.push(kinesisfirehoseutilities.putRecord('transactions', transaction_redshift_obj));

    return Promise.all(promises).then(() => true);
  }

  transformResponse(){

    du.debug('Transform Response');

    let receipttransaction = this.parameters.get('receipttransaction', null, false);
    let processor_response = this.parameters.get('processorresponse');
    let response_category = this.getProcessorResponseCategory();

    let merge_object = {};

    if(_.has(processor_response, 'creditcard')){

      merge_object = {creditcard: processor_response.creditcard};
      delete processor_response.creditcard;

    }

    let response_prototype = objectutilities.merge(
      {
        transaction: receipttransaction,
        processor_response: processor_response,
        response_type: response_category
      },
      merge_object
    );

    let register_response = new RegisterResponse(response_prototype);

    return Promise.resolve(register_response);

  }

  getProcessorResponseCategory(){

    du.debug('Get Processor Response Category');

    let processor_response_code = this.getProcessorResponseCode();

    objectutilities.hasRecursive(this, 'processor_response_map.'+processor_response_code, true);

    return this.processor_response_map[processor_response_code];

  }

  getProcessorResponseCode(){

    du.debug('Get Processor Response');

    return this.parameters.get('processorresponse').code;

  }

  executeProcess(){

    du.debug('Execute Process');

    let rebill = this.parameters.get('rebill');
    let customer = this.parameters.get('customer');
    let merchant_provider_groups = this.parameters.get('merchantprovidergroups');

    let process_promises = objectutilities.map(merchant_provider_groups, merchant_provider => {

      return this.acquireMerchantProvider({merchant_provider: merchant_provider})
      this.processMerchantProviderGroup({customer: customer, merchant_provider: merchant_provider, products: products})
      .then((result) => this.executePostProcess(result))
      .then(() => this.issueReceipt())
      .then(() => this.pushTransactionsRecordToRedshift())

    });
    //do it...



    const ProcessController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
    let processController = new ProcessController();

    return processController.process(argument_object).then(result => {

      this.parameters.set('processorresponse', {
        code: result.getCode(),
        message: result.getMessage(),
        result: result.getResult(),
        merchant_provider: result.merchant_provider,
        creditcard: result.creditcard
      });

      return true;

    });

  }

  processMerchantProviderGroup({customer, merchant_provider, products}){

    let argument_object = {
      customer: customer,
      amount: amount,
      merchant_provider: merchant_provider
    };

    const ProcessController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
    let processController = new ProcessController();

    return processController.process(argument_object).then(result => {

      this.parameters.set('processorresponse', {
        code: result.getCode(),
        message: result.getMessage(),
        result: result.getResult(),
        merchant_provider: result.merchant_provider,
        creditcard: result.creditcard
      });

      return true;

    });

  }

  executePostProcess(processor_response){

    du.debug('Execute Post Process');

    //this.validateProcessorResponse();

    //let processor_response = this.parameters.get('processorresponse');

    return this.merchantProviderController.get({id: processor_response.merchant_provider}).then(merchant_provider => {

      //add this to the object
      this.parameters.set('merchantprovider', merchant_provider);

      return true;

    });

  }

  validateProcessorResponse(){

    du.debug('Validate Processor Response');
    //Technical Debt:  Flesh me out, possible JSON schema embellishment?

  }

  acquireRefundTransactionSubProperties() {

    return Promise.resolve(this.setDependencies())
      .then(() => this.acquireRebill())
      .then(() => this.acquireRebillProperties())
      .then(() => this.acquireRebillSubProperties());

  }

  acquireMerchantProviderGroups(){

    du.debug('Acquire Merchant Provider Groups');

    let rebill =  this.parameters.get('rebill');
    let creditcard = this.parameters.get('selectedcreditcard');

    if(_.has(rebill, 'merchant_provider')){

      //Note:  Merchant Provider is provided in the rebill so, we're hotwiring the SOB
      let merchant_provider_groups = {};
      merchant_provider_groups[rebill.merchant_provider] = rebill.products;

      this.parameters.set('merchantprovidergroups', merchant_provider_groups);

      return Promise.resolve(true);

    }else{



      const MerchantProviderSelectorHelperController = global.SixCRM.routes.include('helpers','transaction/MerchantProviderSelector.js');
      let merchantProviderSelectorHelperController = new MerchantProviderSelectorHelperController();

      return merchantProviderSelectorHelperController.buildMerchantProviderGroups({rebill:rebill, creditcard: creditcard}).then(merchant_provider_groups => {

        this.parameters.set('merchantprovidergroups', merchant_provider_groups);

        return true;

      });

    }

  }

  calculateAmount(){

    du.debug('Calculate Amount');

    let rebill = this.parameters.get('rebill');

    this.parameters.set('amount', rebill.amount);

    return Promise.resolve(true);

  }

  setDependencies(action){

    du.debug('Set Dependencies');

    this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
    //this.productScheduleController = global.SixCRM.routes.include('entities', 'ProductSchedule.js');
    this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

    return true;

  }

  setParameters({argumentation, action}){

    du.debug('Set Parameters');

    this.parameters.setParameters({argumentation: argumentation, action: action});

    this.parameters.set('transactiontype', this.action_to_transaction_type[action]);

    return Promise.resolve(true);

  }

  generateTransactionObject(){

    du.debug('Generate Transaction Object');

    let transaction_object = {
      id: this.parameters.get('receipttransaction').id,
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
    };

    if (!this.affiliateHelperController) {
      this.affiliateHelperController = new AffiliateHelperController();
    }

    return this.affiliateHelperController.transcribeAffiliates(this.parameters.get('parentsession'), transaction_object);

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

}
