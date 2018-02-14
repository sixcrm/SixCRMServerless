'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const uuidV4 = require('uuid/v4');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidProcessReceipt(){

  return {};

}

function getValidProcessResponse(){

  return {
    code:'success',
    message:'Success',
    merchant_provider: getValidMerchantProvider().id,
    creditcard: getValidCreditCard(),
    result: {}
  };

}

function getValidTransactionProducts(){

  return MockEntities.getValidTransactionProducts();

}

function getValidMerchantProviderGroups(ids){
  return MockEntities.getValidMerchantProviderGroups(ids);
}

function getValidMerchantProvider(){
  return MockEntities.getValidMerchantProvider();
}

function getValidCreditCard(){
  return MockEntities.getValidCreditCard();
}

function getValidCreditCards(){
  return [
    getValidCreditCard()
  ];
}

function getValidParentSession(){

  return MockEntities.getValidSession();

}

function getValidProduct(){
  return MockEntities.getValidProduct();
}

function getValidRebill(){

  return MockEntities.getValidRebill();

}

function getValidRebillWithMerchantProvider(){

  let rebill = MockEntities.getValidRebill();

  rebill.merchant_provider = "6c40761d-8919-4ad6-884d-6a46a776cfb9";
  return rebill;

}

function getValidAmount(){
  return 79.99;
}

function getValidProductSchedules(){

  return MockEntities.getValidProductSchedules();

}

function getValidCustomer(){
  return MockEntities.getValidCustomer();
}

function getValidTransactionID(){
  return 'e624af6a-21dc-4c64-b310-3b0523f8ca42';
}

function getValidTransactions(){
  return MockEntities.getValidTransactions();
}

function getValidTransactionObject(){
  return MockEntities.getValidTransaction();
}

function getValidAssociatedTransactions(){
  return MockEntities.getValidTransactions();
}

function getProcessorResponses(count){
  let responses = [];

  for(var i=0; i< count; i++){
    responses.push(getProcessorResponseObject());
  }
  return responses;
}

function getProcessorResponseObject(){

  return {
    code: 'success',
    result: {
      message: "Success",
      result:{
        response:"1",
        responsetext:"SUCCESS",
        authcode:"123456",
        transactionid:"3448894418",
        avsresponse:"N",
        cvvresponse:"",
        orderid:"",
        type:"sale",
        response_code:"100"
      }
    },
    message: 'Some message'
  };

}

function getInvalidArgumentsArray(omit){

  let invalid_arguments = [{}, [], new Error(), null, undefined, 123, 'abc', () => {}];

  omit = (_.isUndefined(omit))?[]:omit;
  return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
    return !(_.contains(omit, invalid_argument));
  });

}

function assumePermissionedRole(){

  let permissions = [
    {
      action:'*',
      object: '*'
    }
  ];

  PermissionTestGenerators.givenUserWithPermissionArray(permissions, 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

}


describe('controllers/providers/Register.js', () => {

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('hydrateTransaction', () => {

   it('fails because user does not have permission', () => {

      PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey')

      let registerController = new RegisterController();

      let parameters = {transaction: getValidTransactionID()};

      return registerController.setParameters({argumentation: parameters, action: 'refund'}).then(() => {

        return registerController.hydrateTransaction().catch(error => {
          expect(error.message).to.equal('[403] Invalid Permissions: user does not have sufficient permission to perform this action.');
        });

      })

    });

   it('successfully hydrates a transaction object from ID', () => {

     let transaction = getValidTransactionObject();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get: ({id, fatal}) => {
          return Promise.resolve(transaction);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('read', 'transaction', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let registerController = new RegisterController();

      let parameters = {transaction: getValidTransactionID()};

      return registerController.setParameters({argumentation: parameters, action: 'refund'}).then(() => {
        return registerController.hydrateTransaction().then((transaction) => {
          let associated_transaction = registerController.parameters.get('associatedtransaction');

          expect(associated_transaction).to.deep.equal(transaction);

        });
      })

    });

   it('successfully hydrates a transaction object from object', () => {

     let transaction = getValidTransactionObject();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get: ({id, fatal}) => {
          return Promise.resolve(transaction);
        }
      });

      //PermissionTestGenerators.givenUserWithAllowed('read', 'transaction', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let registerController = new RegisterController();

      let parameters = {transaction: transaction};

      return registerController.setParameters({argumentation: parameters, action: 'refund'}).then(() => {
        return registerController.hydrateTransaction().then((result) => {
          let associated_transaction = registerController.parameters.get('associatedtransaction');

          expect(associated_transaction).to.deep.equal(transaction);
        });
      });

    });

  });

  //Technical Debt:  This belongs in the test package from the Parameters.js object
  describe('setParameters', () => {

    //Technical Debt: test invalid argumentation types...

   it('fails to set parameters due to missing required parameters', () => {

      let registerController = new RegisterController();

      let parameters = {}

      try{
        registerController.setParameters({argumentation: parameters, action: 'refund'});
      }catch(error){
        expect(error.message).to.equal('[500] Missing source object field: "transaction".');
      }

    });

   it('fails to set parameters due to invalid parameter types', () => {

      let registerController = new RegisterController();

      arrayutilities.map(getInvalidArgumentsArray([undefined]), (invalid_argument) => {

        try{
          registerController.setParameters({argumentation: {transaction: invalid_argument}, action: 'refund'});
        }catch(error){
          expect(error.message).to.have.string('[500] One or more validation errors occurred:');
        }

      });

    });

   it('successfully sets parameters', () => {

      let registerController = new RegisterController();

      let transaction_id = getValidTransactionID();

      return registerController.setParameters({argumentation: {transaction: transaction_id}, action: 'refund'}).then(() => {
        let transaction = registerController.parameters.get('transaction');

        expect(transaction).to.equal(transaction_id);
      });

    });

   it('successfully sets parameters', () => {

      let registerController = new RegisterController();

      let transaction_object = getValidTransactionObject();

      return registerController.setParameters({argumentation: {transaction: transaction_object}, action: 'refund'}).then(() => {
        let transaction = registerController.parameters.get('transaction');

        expect(transaction).to.deep.equal(transaction_object);
      });

    });

  });

  describe('getAssociatedTransactions', () => {

   it('successfully gets associated transactions (empty array)', () => {

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        listByAssociatedTransaction: ({id}) => {
          return Promise.resolve({transactions: null});
        },
        getResult:(result, field) => {
          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      let registerController = new RegisterController();

      let transaction_object = getValidTransactionObject();

      registerController.parameters.set('associatedtransaction', transaction_object);

      return registerController.getAssociatedTransactions().then(() => {
        let associatedtransactions = registerController.parameters.get('associated_transactions');

        expect(associatedtransactions).to.deep.equal([]);
      });

    });

   it('successfully gets associated transactions (non-empty array)', () => {

     let transaction = getValidTransactionObject();
     let associated_transactions = getValidAssociatedTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        listByAssociatedTransaction: ({id}) => {
          return Promise.resolve({transactions: associated_transactions});
        },
        getResult:(result, field) => {
          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      let registerController = new RegisterController();

      registerController.parameters.set('associatedtransaction', transaction);

      return registerController.getAssociatedTransactions().then(() => {
        let associatedtransactions = registerController.parameters.get('associated_transactions');

        expect(associatedtransactions).to.deep.equal(associated_transactions);
      });

    });

  });

  describe('validateAssociatedTransactions', () => {

     it('returns error when transaction with pre-existing refunds/reversals can\'t be reversed', () => {

        let registerController = new RegisterController();

        let associated_transactions = getValidAssociatedTransactions();

        registerController.parameters.set('associated_transactions', associated_transactions);

        try{
          registerController.validateAssociatedTransactions();
          expect(false).to.equal(true);
        }catch(error){
          expect(error.message).to.equal('[403] A transaction with pre-existing refunds or reversals can not be reversed.');
        }

      });

     it('successfully validates associated transactions', () => {

        let registerController = new RegisterController();

        return registerController.validateAssociatedTransactions().then((validated) => {
          expect(validated).to.equal(true);
        });

      });

  });

  describe('setAmount', () => {

   it('successfully sets amount when amount is not set in parameters', () => {

      let registerController = new RegisterController();

      let transaction_object = getValidTransactionObject();

      registerController.parameters.set('associatedtransaction', transaction_object);

      return registerController.setAmount()
      .then(() => {
        let set_amount = registerController.parameters.get('amount');

        expect(set_amount).to.equal(transaction_object.amount);
      });

    });

   it('successfully gets amount when amount is set in parameters', () => {

      let registerController = new RegisterController();

      let transaction_object = getValidTransactionObject();

      return registerController.setParameters({argumentation: {transaction: transaction_object, amount: transaction_object.amount}, action: 'refund'}).then(() => {
        registerController.setAmount()
        .then(() => {
          let set_amount = registerController.parameters.get('amount');

          expect(set_amount).to.equal(transaction_object.amount);
        });

      });

    });

  });

  describe('calculateReversedAmount(', () => {

   it('successfully calculates the reversed amount when there are no associated_transactions', () => {

      let registerController = new RegisterController();

      let associated_transactions = [];

      let reversed_amount = registerController.calculateReversedAmount();

      expect(reversed_amount).to.equal(0);

    });

   it('successfully calculates the reversed amount', () => {

      let registerController = new RegisterController();

      let associated_transactions = getValidAssociatedTransactions();

      let validation_amount = arrayutilities.reduce(associated_transactions, (sum, transaction) => {
        return (sum + parseFloat(transaction.amount));
      })

      let reversed_amount = registerController.calculateReversedAmount(associated_transactions);

      expect(reversed_amount).to.equal(validation_amount)

    });

  });

  describe('validateAmount', () => {

   it('successfully validates amount (no associated transactions)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      registerController.parameters.set('associatedtransaction', transaction);

      registerController.parameters.set('amount', transaction.amount);

      return registerController.validateAmount().then((valid) => {
        expect(valid).to.equal(true);
      });

    });

   it('successfully validates amount (no associated transactions)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      registerController.parameters.set('associatedtransaction', transaction);

      registerController.parameters.set('amount', transaction.amount+0.01);

      try{

        registerController.validateAmount();

      }catch(error){

        expect(error.message).to.equal('[403] The proposed resolved transaction amount is negative.');

      }

    });

   it('successfully validates amount (reversals exceed transaction amount)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      let associated_transactions = getValidAssociatedTransactions();

      registerController.parameters.set('associatedtransaction', transaction);

      registerController.parameters.set('associated_transactions', associated_transactions);

      registerController.parameters.set('amount', transaction.amount);

      try{

        registerController.validateAmount()

      }catch(error){

        expect(error.message).to.equal('[403] The proposed resolved transaction amount is negative.');

      }


    });

   it('successfully validates amount (reversals do not exceed transaction amount)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      let associated_transactions = getValidAssociatedTransactions();

      arrayutilities.map(associated_transactions, (at, index) => {
        associated_transactions[index].amount = 0.00;
      });

      registerController.parameters.set('associatedtransaction', transaction);

      registerController.parameters.set('associated_transactions', associated_transactions);

      registerController.parameters.set('amount', transaction.amount);

      registerController.validateAmount().then((validated) => {
        expect(validated).to.equal(true);
      });

    });

   it('successfully validates amount (reversals do not exceed transaction amount and amount is a specific not the full amount)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();
      let associated_transactions = getValidAssociatedTransactions();

      arrayutilities.map(associated_transactions, (at, index) => {
        associated_transactions[index].amount = randomutilities.randomDouble(0, 1.00);
      });

      registerController.parameters.set('associatedtransaction', transaction);
      registerController.parameters.set('associated_transactions', associated_transactions);
      registerController.parameters.set('amount', 1.00);

      registerController.validateAmount().then((validated) => {
        expect(validated).to.equal(true);
      });

    });

  });

  describe('executeRefund', () => {

   it('successfully executes a refund', () => {

      let fake = class Refund {

        constructor(){

        }

        refund(){

          return Promise.resolve({
            code: 'error',
            result:
             { response: '3',
               responsetext: 'Refund amount may not exceed the transaction balance REFID:3220888806',
               authcode: '',
               transactionid: '',
               avsresponse: '',
               cvvresponse: '',
               orderid: '',
               type: 'refund',
               response_code: '300' },
            message: 'Refund amount may not exceed the transaction balance REFID:3220888806'
          });

        }

      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Refund.js'), fake);

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      let associated_transactions = getValidAssociatedTransactions();

      arrayutilities.map(associated_transactions, (at, index) => {
        associated_transactions[index].amount = randomutilities.randomDouble(0, 1.00);
      });

      registerController.parameters.set('associatedtransaction', transaction);

      registerController.parameters.set('amount', 1.00);

      return registerController.executeRefund().then(() => {

        let response = registerController.parameters.get('processorresponse');

        expect(response).to.have.property('message');
        expect(response).to.have.property('code');
        expect(response).to.have.property('result');

      });

    });

  });

  describe('executeReverse', () => {

   it('successfully executes a reverse', () => {

      let fake = class Reverse {

        constructor(){

        }

        reverse(){

          return Promise.resolve({
            code: 'error',
            result:
             { response: '3',
               responsetext: 'Reverse amount may not exceed the transaction balance REFID:3220888806',
               authcode: '',
               transactionid: '',
               avsresponse: '',
               cvvresponse: '',
               orderid: '',
               type: 'refund',
               response_code: '300' },
            message: 'Reverse amount may not exceed the transaction balance REFID:3220888806'
          });

        }

      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Reverse.js'), fake);

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      let associated_transactions = getValidAssociatedTransactions();

      arrayutilities.map(associated_transactions, (at, index) => {
        associated_transactions[index].amount = randomutilities.randomDouble(0, 1.00);
      });

      registerController.parameters.set('associatedtransaction', transaction);

      return registerController.executeReverse().then(() => {

        let response = registerController.parameters.get('processorresponse');

        expect(response).to.have.property('message');
        expect(response).to.have.property('code');
        expect(response).to.have.property('result');

      });

    });

  });

  describe('executeProcess', () => {

    it('successfully executes a process', () => {

      let rebill = getValidRebill();
      let merchant_provider = getValidMerchantProvider();

      rebill.merchant_provider = merchant_provider.id;
      let merchant_provider_groups = getValidMerchantProviderGroups([merchant_provider.id]);

      merchant_provider_groups[merchant_provider.id] = [rebill.products];

      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let amount = getValidAmount();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), class Process {
        constructor(){}
        process(){
          return Promise.resolve({
            getCode: () => {
              return 'error';
            },
            getMessage: () => {
              return 'Refund amount may not exceed the transaction balance REFID:3220888806';
            },
            getResult:() => {
              return { response: '3',
                responsetext: 'Refund amount may not exceed the transaction balance REFID:3220888806',
                authcode: '',
                transactionid: '',
                avsresponse: '',
                cvvresponse: '',
                orderid: '',
                type: 'refund',
                response_code: '300' };
            },
            merchant_provider:merchant_provider.id,
            creditcard: creditcard.id,
            code: 'error',
            result:
             { response: '3',
               responsetext: 'Refund amount may not exceed the transaction balance REFID:3220888806',
               authcode: '',
               transactionid: '',
               avsresponse: '',
               cvvresponse: '',
               orderid: '',
               type: 'refund',
               response_code: '300' },
            message: 'Refund amount may not exceed the transaction balance REFID:3220888806'
          });

        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        create:({entity}) => {
          entity.id = uuidV4();
          entity.created_at = timestamp.getISO8601();
          entity.updated_at = timestamp.getISO8601();

          return Promise.resolve(entity);
        },
        createAlias(){
          return 'T'+randomutilities.createRandomString(9);
        }
      });

      let registerController = new RegisterController();

      registerController.parameters.set('rebill', rebill);
      registerController.parameters.set('customer', customer);
      registerController.parameters.set('selectedcreditcard', creditcard)
      registerController.parameters.set('merchantprovidergroups', merchant_provider_groups);

      return registerController.executeProcess({merchant_provider: merchant_provider.id, amount: amount}).then((result) => {

        expect(result).to.equal(true);

        //let response = registerController.parameters.get('processorresponses');

        //expect(response).to.have.property('message');
        //expect(response).to.have.property('code');
        //expect(response).to.have.property('result');

      });

    });

  });

  xdescribe('issueReceipt', () => {

   it('creates a transaction receipt for successful sale', () => {

      let mock_receipt = class {
        constructor(){}
        issueReceipt({argumentation}){
          return Promise.resolve(getValidTransactionObject());
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      let mock_preindexing_helper = class {
        constructor(){

        }
        addToSearchIndex(entity){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(entity){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

      assumePermissionedRole();

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();
      let processor_response = getProcessorResponseObject();

      registerController.parameters.set('rebill', getValidRebill());
      registerController.parameters.set('transactiontype', 'sale');
      registerController.parameters.set('amount', 10.00);
      registerController.parameters.set('processorresponse', processor_response);
      registerController.parameters.set('merchantprovider', getValidMerchantProvider());
      registerController.parameters.set('transactionproducts', transaction.products);

      return registerController.issueReceipt().then(() => {

        let result_transaction = registerController.parameters.get('receipttransaction');

        expect(result_transaction).to.have.property('id');
        expect(result_transaction).to.have.property('type');
        expect(result_transaction.type).to.equal('sale');
        expect(result_transaction.result).to.equal('success');

      });

    });

   it('creates a transaction for sale decline', () => {

      let mock_receipt = class {
        constructor(){}
        issueReceipt({argumentation}){
          let transaction = getValidTransactionObject();

          transaction.result = 'declined';
          return Promise.resolve(transaction);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      let mock_preindexing_helper = class {
        constructor(){

        }
        addToSearchIndex(entity){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(entity){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

      assumePermissionedRole();

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();
      let processor_response = getProcessorResponseObject();

      processor_response.code = 'declined';

      registerController.parameters.set('rebill', getValidRebill());
      registerController.parameters.set('transactiontype', 'sale');
      registerController.parameters.set('associatedtransaction', transaction);
      registerController.parameters.set('amount', 10.00);
      registerController.parameters.set('processorresponse', processor_response);
      registerController.parameters.set('merchantprovider', getValidMerchantProvider());
      registerController.parameters.set('transactionproducts', getValidTransactionProducts());

      return registerController.issueReceipt().then(() => {

        let result_transaction = registerController.parameters.get('receipttransaction');

        expect(result_transaction).to.have.property('id');
        expect(result_transaction).to.have.property('type');
        expect(result_transaction).to.have.property('result');
        expect(result_transaction.type).to.equal('sale');
        expect(result_transaction.result).to.equal('declined');

      });

    });

   it('creates a transaction for refund error', () => {

      let mock_receipt = class {
        constructor(){}
        issueReceipt({argumentation}){
          let transaction = getValidTransactionObject();

          transaction.type = 'refund';
          transaction.result = 'error';
          transaction.associated_transaction = transaction.id;
          return Promise.resolve(transaction);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      let mock_preindexing_helper = class {
        constructor(){

        }
        addToSearchIndex(entity){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(entity){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

      assumePermissionedRole();

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();
      let processor_response = getProcessorResponseObject();

      processor_response.code = 'error';

      registerController.parameters.set('rebill', getValidRebill());
      registerController.parameters.set('transactiontype', 'refund');
      registerController.parameters.set('associatedtransaction', transaction);
      registerController.parameters.set('amount', 10.00);
      registerController.parameters.set('processorresponse', processor_response);

      return registerController.issueReceipt().then(() => {

        let receipt_transaction = registerController.parameters.get('receipttransaction');

        expect(receipt_transaction).to.have.property('id');
        expect(receipt_transaction).to.have.property('associated_transaction');
        expect(receipt_transaction).to.have.property('type');
        expect(receipt_transaction).to.have.property('result');
        expect(receipt_transaction.associated_transaction).to.equal(transaction.id);
        expect(receipt_transaction.type).to.equal('refund');
        expect(receipt_transaction.result).to.equal('error');

      });

    });

   xit('rejects when creation of transaction was unsuccessful', () => {

        assumePermissionedRole();

        mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
          queryRecords: (table, parameters, index, callback) => {
            return Promise.resolve([]);
          },
          saveRecord: (tableName, entity, callback) => {
            return Promise.reject(new Error('Saving failed.'));
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
          createActivity: (actor, action, acted_upon, associated_with) => {
            return true;
          }
        });

        let mock_preindexing_helper = class {
          constructor(){

          }
          addToSearchIndex(entity){
            return Promise.resolve(true);
          }
          removeFromSearchIndex(entity){
            return Promise.resolve(true);
          }
        }

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', getValidRebill());
        registerController.parameters.set('amount', getValidAmount());
        registerController.parameters.set('transactiontype', 'sale');
        registerController.parameters.set('merchantprovider', getValidMerchantProvider());
        registerController.parameters.set('transactionproducts', getValidTransactionProducts());

        let processor_response = getProcessorResponseObject();

        processor_response.code = 'error';
        registerController.parameters.set('processorresponse', processor_response);

        return registerController.issueReceipt().catch((error) => {
          expect(error.message).to.equal('Saving failed.');
        });

    });

  });

  describe('validateRebillTimestamp', () => {

   it('successfully validates a rebill timestamp', () => {

      let valid_rebill = getValidRebill();

      let registerController = new RegisterController();

      registerController.parameters.set('rebill', valid_rebill);

      return registerController.validateRebillTimestamp().then(result => {
        expect(result).to.equal(true);
      });

    });

   it('returns error if rebill is not eligible for processing at this time', (done) => {

      let date = new Date();

      let valid_rebill = getValidRebill();

      let registerController = new RegisterController();

      registerController.parameters.set('rebill', valid_rebill);

      date.setDate(date.getDate() + 1); //add one day so it would be too soon for rebill processing

      valid_rebill.bill_at = date;

      try{
        registerController.validateRebillTimestamp()
      }catch (error){
        expect(error.message).to.have.string('[500] Rebill is not eligible for processing at this time');
        done();
      }

    });

  });

  describe('validateAttemptRecord', () => {

   it('successfully validates a rebill against attempt record', () => {

      let valid_rebill = getValidRebill();

      let registerController = new RegisterController();

      registerController.parameters.set('rebill', valid_rebill);

      return registerController.validateRebillTimestamp().then(result => {
        expect(result).to.equal(true);
      });

    });

   it('returns error if rebill has been attempted three times', (done) => {

      let valid_rebill = getValidRebill();

      let registerController = new RegisterController();

      registerController.parameters.set('rebill', valid_rebill);

      valid_rebill.second_attempt = Date.now();

      try {
          registerController.validateAttemptRecord()
      } catch(error) {
          expect(error.message).to.equal('[500] The rebill has already been attempted three times.');
          done()
      }

    });

   it('returns error if rebill attempt was too recent', (done) => {

        let valid_rebill = getValidRebill();

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', valid_rebill);

        valid_rebill.first_attempt = Date.now();

        try {
            registerController.validateAttemptRecord()
        } catch(error) {
            expect(error.message).to.equal('[500] Rebill\'s first attempt is too recent.');
            done()
        }

    });

  });

  describe('acquireRebillProperties', () => {

     it('successfully acquires rebill properties', () => {

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          listProductSchedules: (rebill) => {
            return Promise.resolve(getValidProductSchedules());
          },
          getParentSession: (rebill) => {
            return Promise.resolve(getValidParentSession());
          }
        });

        PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

        let valid_rebill = getValidRebill();

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', valid_rebill);

        return registerController.acquireRebillProperties().then(result => {

          expect(result).to.equal(true);

          let parentsession = registerController.parameters.get('parentsession');

        });

      });

    });

    describe('validateSession', () => {

     it('successfully validates a parent session', () => {

        let parent_session = getValidParentSession();

        let registerController = new RegisterController();

        registerController.parameters.set('parentsession', parent_session);

        return registerController.validateSession().then(result => {

          expect(result).to.equal(true);

        });

      });

     it('returns error when session has invalid day in cycle', () => {

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
          constructor(){}
          calculateDayInCycle(session_start){
              return -1; //any negative number
          }
        });

        let parent_session = getValidParentSession();

        let registerController = new RegisterController();

        registerController.parameters.set('parentsession', parent_session);

        try{
          registerController.validateSession()
        }catch(error){
            expect(error.message).to.equal('[500] Invalid day in cycle returned for session.');
        }

      });

    });

    describe('validateRebillForProcessing', () => {

     it('successfully validates a rebill', () => {

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          listProductSchedules: (rebill) => {
            return Promise.resolve(getValidProductSchedules());
          },
          getParentSession: (rebill) => {
            return Promise.resolve(getValidParentSession());
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
          constructor(){}
          calculateDayInCycle(session_start){
            return timestamp.getDaysDifference(session_start);
          }
          isAvailable({rebill}){
            return true;
          }
        });

        let rebill = getValidRebill();
        let parentsession = getValidParentSession();

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', rebill);
        registerController.parameters.set('parentsession', parentsession);

        return registerController.validateRebillForProcessing().then(result => {

          expect(result).to.equal(true);

        }).catch(error => {

          throw error;

        });

      });

    });

    describe('acquireRebillSubProperties', () => {

     it('successfully acquires rebill subproperties', () => {

        let rebill = getValidRebill();
        let parentsession = getValidParentSession();
        let merchant_provider_groups = getValidMerchantProviderGroups();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
          getCreditCards:(customer) => {
            return Promise.resolve(getValidCreditCards());
          },
          get:({id}) => {
            return Promise.resolve(getValidCustomer());
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/MerchantProviderSelector.js'), class {
          constructor(){}
          buildMerchantProviderGroups(){
            return Promise.resolve(merchant_provider_groups);
          }
        });

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', rebill);
        registerController.parameters.set('parentsession', parentsession);

        return registerController.acquireRebillSubProperties().then(result => {

          expect(result).to.equal(true);

          let creditcards = registerController.parameters.get('creditcards');
          let customer = registerController.parameters.get('customer');
          let selected_creditcard = registerController.parameters.get('selectedcreditcard');
          let merchant_provider_groups = registerController.parameters.get('merchantprovidergroups');

        });

      });

    });

    describe('transformResponse', () => {

     it('successfully responds to success', () => {

        let registerController = new RegisterController();
        let transactions = getValidTransactions();
        let processor_responses = getProcessorResponses(transactions.length);
        let creditcard = getValidCreditCard();

        registerController.parameters.set('transactionreceipts', transactions);
        registerController.parameters.set('processorresponses', processor_responses);
        registerController.parameters.set('selectedcreditcard', creditcard)

        return registerController.transformResponse().then(response => {

          expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
          expect(response.getCode()).to.equal('success');
          expect(response.getTransactions()).to.deep.equal(transactions);
          expect(response.getProcessorResponses()).to.deep.equal(processor_responses);

        });

      });

     it('successfully responds to decline', () => {

        let processor_responses = getProcessorResponses(1);

        processor_responses[0].code = 'declined';

        let declined_transaction = getValidTransactionObject();

        declined_transaction.result = 'declined';

        let creditcard = getValidCreditCard();

        let registerController = new RegisterController();

        registerController.parameters.set('transactionreceipts', [declined_transaction]);
        registerController.parameters.set('processorresponses', processor_responses);
        registerController.parameters.set('selectedcreditcard', creditcard)

        return registerController.transformResponse().then(response => {

          expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
          expect(response.getCode()).to.equal('fail');
          expect(response.getTransactions()).to.deep.equal([declined_transaction]);
          expect(response.getProcessorResponses()).to.deep.equal(processor_responses);

        });

      });

     it('successfully responds to error', () => {

        let processor_responses = getProcessorResponses(1);

        processor_responses[0].code = 'error';

        let error_transaction = getValidTransactionObject();

        error_transaction.result = 'error';

        let creditcard = getValidCreditCard();

        let registerController = new RegisterController();

        registerController.parameters.set('transactionreceipts', [error_transaction]);
        registerController.parameters.set('processorresponses', processor_responses);
        registerController.parameters.set('selectedcreditcard', creditcard)

        return registerController.transformResponse().then(response => {

          expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
          expect(response.getCode()).to.equal('error');
          expect(response.getTransactions()).to.deep.equal([error_transaction]);
          expect(response.getProcessorResponses()).to.deep.equal(processor_responses);

        });

      });

    });

    describe('processTransaction', () => {

      xit('successfully processes a transaction', () => {

        let creditcard = getValidCreditCard();

        let mock_register_response = class RegisterResponse {
          constructor(){}
        };

        mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Response.js'), mock_register_response);

        let mock_receipt = class {
          constructor(){}
          issueReceipt({argumentation}){
            let transaction = getValidTransactionObject();

            return Promise.resolve(transaction);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

        let mock_process = class {
          constructor(){}
          process({customer: customer, productschedule: productschedule, amount: amount}){
            return Promise.resolve(getValidProcessResponse());
          }
        }

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), mock_process);

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CreditCard.js'), {
          get:({id}) => {
            return Promise.resolve(creditcard);
          },
          getBINNumber:(creditcard) => {
            let cc_number = null;

            if(_.has(creditcard, 'number')){
              cc_number = creditcard.number;
            }else if(_.isString(creditcard)){
              cc_number = creditcard;
            }
            if(!_.isNull(cc_number)){
              cc_number = cc_number.slice(0,6);
            }
            return cc_number;
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listProductSchedules: (rebill) => {
            return Promise.resolve(getValidProductSchedules());
          },
          getParentSession: (rebill) => {
            return Promise.resolve(getValidParentSession())
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
          constructor(){}
          calculateDayInCycle(session_start){
            return timestamp.getDaysDifference(session_start);
          }
          isAvailable({rebill}){
            return true;
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Customer.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidCustomer());
          },
          getCreditCards: () => {
            return Promise.resolve(getValidCreditCards());
          },
          getID: (object) => {

              if(_.isString(object)){
                  return object;
              }else if(_.isObject(object)){
                  if(_.has(object, 'id')){
                    return object['id'];
                  }
              }else if(_.isNull(object)){
                  return null;
              }

          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
          getID: (object) => {

              if(_.isString(object)){
                  return object;
              }else if(_.isObject(object)){
                  if(_.has(object, 'id')){
                    return object['id'];
                  }
              }else if(_.isNull(object)){
                  return null;
              }

          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
          createActivity: (actor, action, acted_upon, associated_with) => {
            return true;
          }
        });

        let mock_preindexing_helper = class {
          constructor(){

          }
          addToSearchIndex(entity){
            return Promise.resolve(true);
          }
          removeFromSearchIndex(entity){
            return Promise.resolve(true);
          }
        }

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/MerchantProvider.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidMerchantProvider());
          }
        });

        let valid_rebill = getValidRebill();

        PermissionTestGenerators.givenUserWithAllowed('*', '*');

        let registerController = new RegisterController();

        return registerController.processTransaction({rebill: valid_rebill}).then(result => {

          expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

        });

      });

    });

    describe('reverseTransaction', () => {

     xit('successfully reverses a transaction', () => {

        let mock_register_response = class RegisterResponse {
          constructor(){}
        };

        mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Response.js'), mock_register_response);

        let mock_receipt = class {
          constructor(){}
          issueReceipt({argumentation}){
            let transaction = getValidTransactionObject();

            return Promise.resolve(transaction);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidTransactionObject())
          },
          listByAssociatedTransaction: () => {
            return Promise.resolve({transactions:[]});
          },
          getResult: (result, field) => {

            du.debug('Get Result');

            if(_.isUndefined(field)){
              field = this.descriptive_name+'s';
            }

            if(_.has(result, field)){
              return Promise.resolve(result[field]);
            }else{
              return Promise.resolve(null);
            }

          },
          getMerchantProvider: (transaction) => {
            return Promise.resolve(getValidMerchantProvider());
          },
          getID: (object) => {

              if(_.isString(object)){
                  return object;
              }else if(_.isObject(object)){
                  if(_.has(object, 'id')){
                    return object['id'];
                  }
              }else if(_.isNull(object)){
                  return null;
              }

          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
          createActivity: (actor, action, acted_upon, associated_with) => {
            return true;
          }
        });

        let mock_preindexing_helper = class {
          constructor(){

          }
          addToSearchIndex(entity){
            return Promise.resolve(true);
          }
          removeFromSearchIndex(entity){
            return Promise.resolve(true);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

        let mock_refund = class {

          constructor(){}

          reverse(){
            return Promise.resolve(getValidProcessResponse());
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Reverse.js'), mock_refund);

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidRebillWithMerchantProvider())
          },
          getMerchantProvider: (rebill) => {
            return Promise.resolve(getValidMerchantProvider())
          },
          getParentSession: (rebill) => {
            return Promise.resolve(getValidParentSession());
          },
          listProductSchedules: (rebill) => {
            return Promise.resolve(getValidProductSchedules());
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Customer.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidCustomer())
          },
          getCreditCards: (customer) => {
            return Promise.resolve(getValidCreditCards())
          }
        });

        let mock_productschedule = class {
          constructor(){

          }
          getTransactionProducts({day, product_schedules}){
            return Promise.resolve([]);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), mock_productschedule);

        let mock_rebill_helper = class {
          constructor(){

          }
          calculateDayInCycle(session_created_at){
            return Promise.resolve(5);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

        mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
          putRecord: (table, object) => {
            console.log(table, object);
            return Promise.resolve({});
          }
        });

        PermissionTestGenerators.givenUserWithAllowed('*', '*');

        let valid_transaction = getValidTransactionObject();

        let registerController = new RegisterController();

        return registerController.reverseTransaction({transaction: valid_transaction}).then(result => {

          expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

        });

      });

    });

    describe('refundTransaction', () => {

     xit('successfully reverses a transaction', () => {

        let mock_register_response = class RegisterResponse {
          constructor(){}
        };

        mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Response.js'), mock_register_response);

        let mock_receipt = class {
          constructor(){}
          issueReceipt({argumentation}){
            let transaction = getValidTransactionObject();

            return Promise.resolve(transaction);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidTransactionObject())
          },
          listByAssociatedTransaction: () => {
            return Promise.resolve({transactions:[]});
          },
          getResult: (result, field) => {

            du.debug('Get Result');

            if(_.isUndefined(field)){
              field = this.descriptive_name+'s';
            }

            if(_.has(result, field)){
              return Promise.resolve(result[field]);
            }else{
              return Promise.resolve(null);
            }

          },
          getMerchantProvider: (transaction) => {
            return Promise.resolve(getValidMerchantProvider());
          },
          getID: (object) => {

              if(_.isString(object)){
                  return object;
              }else if(_.isObject(object)){
                  if(_.has(object, 'id')){
                    return object['id'];
                  }
              }else if(_.isNull(object)){
                  return null;
              }

          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
          createActivity: (actor, action, acted_upon, associated_with) => {
            return true;
          }
        });

        let mock_preindexing_helper = class {
          constructor(){

          }
          addToSearchIndex(entity){
            return Promise.resolve(true);
          }
          removeFromSearchIndex(entity){
            return Promise.resolve(true);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

        let mock_refund = class {

            constructor(){}

            refund(){
                return Promise.resolve(getValidProcessResponse());
            }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Refund.js'), mock_refund);

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidRebillWithMerchantProvider())
          },
          getMerchantProvider: (rebill) => {
            return Promise.resolve(getValidMerchantProvider())
          },
          getParentSession: (rebill) => {
            return Promise.resolve(getValidParentSession());
          },
          listProductSchedules: (rebill) => {
            return Promise.resolve(getValidProductSchedules());
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Customer.js'), {
          get: ({id}) => {
            return Promise.resolve(getValidCustomer())
          },
          getCreditCards: (customer) => {
            return Promise.resolve(getValidCreditCards())
          }
        });

        let mock_productschedule = class {
          constructor(){

          }
          getTransactionProducts({day, product_schedules}){
            return Promise.resolve([]);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), mock_productschedule);

        let mock_rebill_helper = class {
          constructor(){

          }
          calculateDayInCycle(session_created_at){
            return Promise.resolve(5);
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

        mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
          putRecord: (table, object) => {
            console.log(table, object);
            return Promise.resolve({});
          }
        });

        PermissionTestGenerators.givenUserWithAllowed('*', '*');

        let valid_transaction = getValidTransactionObject();

        du.warning(valid_transaction);

        let valid_amount = (valid_transaction.amount - 10.00);

        let registerController = new RegisterController();

        return registerController.refundTransaction({transaction: valid_transaction, amount: valid_amount}).then(result => {

          expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

        });

      });

    });

    describe('calculateAmountFromProductGroups', () => {

     it('correctly calculates the amount', () => {

        let test_cases = [
          {
            a: 3.99,
            b: 0.14
          },
          {
            a: 3.99,
            b: 1.00
          },
          {
            a: 39239238923.99,
            b: 123.00
          }
        ];

        arrayutilities.map(test_cases, test_case => {

          let product_groups = [
            {
              quantity: 1,
              product:getValidProduct(),
              amount:test_case.a
            },
            {
              quantity: 1,
              product:getValidProduct(),
              amount:test_case.b
            }
          ];

          let registerController = new RegisterController();

          let result = registerController.calculateAmountFromProductGroups([product_groups]);

          expect(result).to.equal(mathutilities.sum([test_case.a, test_case.b]));

        });

      });

    });

    describe('pushTransactionsRecordToRedshift', () => {

      before(() => {
        mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
        });
      });

      beforeEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
      });

      afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
      });

     xit('Successfuly sends data to redshift', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
          putRecord: (table, object) => {
            expect(['product_schedules', 'transactions']).to.include(table);

            if (table === 'product_schedules') {
              expect(object.transactions_id).to.equal(getValidTransactionObject().id);
              expect(object.product_schedule).to.equal(getValidProductSchedules()[0].id);
              expect(object.datetime).to.equal(getValidTransactionObject().created_at);

            }

            if (table === 'transactions') {
              expect(object.id).to.equal(getValidTransactionObject().id);
              expect(object.customer).to.equal(getValidCustomer().id);
              expect(object.creditcard).to.equal(getValidCreditCard().id);
              expect(object.merchant_provider).to.equal(getValidMerchantProvider().id);
              expect(object.campaign).to.equal(getValidParentSession().campaign);
              expect(object.account).to.equal(getValidParentSession().account);
              expect(object.affiliate).to.equal(getValidParentSession().affiliate);
              expect(object.subaffiliate_1).to.equal(getValidParentSession().subaffiliate_1);
              expect(object.subaffiliate_2).to.equal(getValidParentSession().subaffiliate_2);
              expect(object.subaffiliate_3).to.equal(getValidParentSession().subaffiliate_3);
              expect(object.subaffiliate_4).to.equal(getValidParentSession().subaffiliate_4);
              expect(object.subaffiliate_5).to.equal(getValidParentSession().subaffiliate_5);
              expect(object.datetime).to.equal(getValidTransactionObject().created_at);
              expect(object.processor_result).to.equal('success');
              expect(object.amount).to.equal(getValidAmount());
              expect(object.type).to.equal('new');
              expect(object.subtype).to.equal('main');
            }

            return Promise.resolve(true);
          }
        });

        let Register = global.SixCRM.routes.include('providers', 'register/Register.js');

        let registerController = new Register();

        registerController.parameters.set('receipttransaction', getValidTransactionObject());
        registerController.parameters.set('customer', getValidCustomer());
        registerController.parameters.set('processorresponse', getValidProcessResponse());
        registerController.parameters.set('merchantprovider', getValidMerchantProvider());
        registerController.parameters.set('parentsession', getValidParentSession());
        registerController.parameters.set('amount', getValidAmount());
        registerController.parameters.set('productschedules', getValidProductSchedules());

        return registerController.pushTransactionsRecordToRedshift().then(result => {

          expect(result).to.equal(true);

        });
      });

    })

});
