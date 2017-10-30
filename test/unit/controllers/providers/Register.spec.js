'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

function getValidTransactionID(){
  return 'e624af6a-21dc-4c64-b310-3b0523f8ca42';
}

function getValidTransactionObject(){
  return {
    "amount": 34.99,
    "id": "e624af6a-21dc-4c64-b310-3b0523f8ca42",
    "alias":"T56S2HJO32",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    "processor_response": "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    "products":[{
      "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
      "amount":34.99
    }],
    "type":"sale",
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };
}

function getValidAssociatedTransactions(){
  return [{
    "amount": 34.99,
    "id": "d376f777-3e0b-43f7-a5eb-98ee109fa2c5",
    "alias":"T56S2HJ922",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    "processor_response": "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    "products":[{
      "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
      "amount":34.99
    }],
    "type":"reverse",
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  },
  {
    "amount": 13.22,
    "id": "d376f777-3e0b-43f7-a5eb-98ee109fa2c5",
    "alias":"T56S2HJ922",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    "processor_response": "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    "products":[{
      "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
      "amount":34.99
    }],
    "type":"refund",
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  }];
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

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get: ({id, fatal}) => {
          return Promise.resolve(getValidTransactionObject());
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('read', 'transaction', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let registerController = new RegisterController();

      let parameters = {transaction: getValidTransactionID()};

      return registerController.setParameters({argumentation: parameters, action: 'refund'}).then(() => {
        return registerController.hydrateTransaction().then((transaction) => {

          let expected_transaction = getValidTransactionObject();
          let hydrated_transaction = registerController.parameters.get('hydrated_transaction');

          expect(hydrated_transaction).to.deep.equal(expected_transaction);

        });
      })

    });

    it('successfully hydrates a transaction object from object', () => {

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        get: ({id, fatal}) => {
          return Promise.resolve(getValidTransactionObject());
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('read', 'transaction', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let registerController = new RegisterController();

      let parameters = {transaction: getValidTransactionObject()};

      return registerController.setParameters({argumentation: parameters, action: 'refund'}).then(() => {
        return registerController.hydrateTransaction().then((transaction) => {

          let expected_transaction = getValidTransactionObject();
          let hydrated_transaction = registerController.parameters.get('hydrated_transaction');

          expect(hydrated_transaction).to.deep.equal(expected_transaction);

        });
      })

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
          expect(error.message).to.equal('[500] One or more validation errors occurred.');
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

      registerController.parameters.set('hydrated_transaction', transaction_object);

      return registerController.getAssociatedTransactions().then(() => {
        let associatedtransactions = registerController.parameters.get('associated_transactions');

        expect(associatedtransactions).to.deep.equal([]);
      });

    });

    it('successfully gets associated transactions (non-empty array)', () => {

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
        listByAssociatedTransaction: ({id}) => {
          return Promise.resolve({transactions: getValidAssociatedTransactions()});
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

      registerController.parameters.set('hydrated_transaction', transaction_object);

      return registerController.getAssociatedTransactions().then(() => {
        let associatedtransactions = registerController.parameters.get('associated_transactions');

        expect(associatedtransactions).to.deep.equal(getValidAssociatedTransactions());
      });

    });

  });

  describe('setAmount', () => {

    it('successfully sets amount when amount is not set in parameters', () => {

      let registerController = new RegisterController();

      let transaction_object = getValidTransactionObject();

      registerController.parameters.set('hydrated_transaction', transaction_object);

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

      let reversed_amount = registerController.calculateReversedAmount(associated_transactions);

      expect(reversed_amount).to.equal(48.21)

    });

  });

  describe('validateAmount', () => {

    it('successfully validates amount (no associated transactions)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      registerController.parameters.set('hydrated_transaction', transaction);

      registerController.parameters.set('amount', transaction.amount);

      return registerController.validateAmount().then((valid) => {
        expect(valid).to.equal(true);
      });

    });

    it('successfully validates amount (no associated transactions)', () => {

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();

      registerController.parameters.set('hydrated_transaction', transaction);

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

      registerController.parameters.set('hydrated_transaction', transaction);

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

      associated_transactions[1].amount = 0.00;
      associated_transactions[0].amount = 0.00;

      registerController.parameters.set('hydrated_transaction', transaction);

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

      associated_transactions[1].amount = 14.99;
      associated_transactions[0].amount = 9.99;

      registerController.parameters.set('hydrated_transaction', transaction);

      registerController.parameters.set('associated_transactions', associated_transactions);

      registerController.parameters.set('amount', 10.00);

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

      associated_transactions[1].amount = 14.99;
      associated_transactions[0].amount = 9.99;

      registerController.parameters.set('hydrated_transaction', transaction);

      registerController.parameters.set('amount', 10.00);

      return registerController.executeRefund().then(() => {

        let response = registerController.parameters.get('processor_response');

        expect(response).to.have.property('message');
        expect(response).to.have.property('code');
        expect(response).to.have.property('result');

      });

    });

  });

  describe('createTransaction', () => {

    it('creates a transaction for successes', () => {

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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

      assumePermissionedRole()

      let registerController = new RegisterController();

      let transaction = getValidTransactionObject();
      let processor_response = getProcessorResponseObject();

      registerController.parameters.set('transaction_type', 'refund');
      registerController.parameters.set('hydrated_transaction', transaction);
      registerController.parameters.set('amount', 10.00);
      registerController.parameters.set('processor_response', processor_response);

      return registerController.createTransaction().then(() => {

        let result_transaction = registerController.parameters.get('result_transaction');

        du.warning(result_transaction);

        expect(result_transaction).to.have.property('id');
        expect(result_transaction).to.have.property('associated_transaction');
        expect(result_transaction).to.have.property('type');
        expect(result_transaction.associated_transaction).to.equal(transaction.id);
        expect(result_transaction.type).to.equal('refund');

      });

    });

  });

});
