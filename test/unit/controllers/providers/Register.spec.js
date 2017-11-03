'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

function getValidCreditCard(){
  return {
    "account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "address": {
      "city": "Portland",
      "country": "USA",
      "line1": "102 Skid Rw.",
      "line2": "Suite 100",
      "state": "Oregon",
      "zip": "97213"
    },
    "ccv": "999",
    "created_at": "2017-10-15T03:55:54.068Z",
    "expiration": "1025",
    "id": "105207a0-928d-4dd4-a0d6-889965a621fa",
    "name": "Rama3 Damunaste",
    "number": "3111111111111111",
    "updated_at": "2017-10-15T03:55:57.293Z"
  };
}

function getValidCreditCards(){
  return [
    getValidCreditCard()
  ];
}

function getValidParentSession(){

  return {
    completed: 'false',
    subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    created_at: '2017-04-06T18:40:41.405Z',
    subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
    subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
    subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    product_schedules: [ '2200669e-5e49-4335-9995-9c02f041d91b' ],
    updated_at: '2017-04-06T18:41:12.521Z',
    affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
    id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
    cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
  };

}

function getValidRebill(){

  return {
    "bill_at": "2017-04-06T18:40:41.405Z",
    "id": "70de203e-f2fd-45d3-918b-460570338c9b",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "parentsession": "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
    "product_schedules": ["2200669e-5e49-4335-9995-9c02f041d91b"],
    "amount": 79.99,
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };

}

function getValidAmount(){
  return 79.99;
}

function getValidProductSchedules(){

  return [
    {
      updated_at: '2017-04-06T18:41:12.521Z',
      schedule:[
        {
          start: 0,
          period: 30,
          price: 79.99,
          product_id: '6d90346a-5547-454c-91fe-9d101a08f68f'
        }
      ],
      created_at: '2017-04-06T18:40:41.405Z',
      account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      id: '2200669e-5e49-4335-9995-9c02f041d91b',
      name: 'Testing Product Schedule',
      loadbalancer: '927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3'
    }
  ];

}

function getValidCustomer(){
  return {
    updated_at: '2017-10-31T20:10:05.380Z',
    lastname: 'Damunaste',
    created_at: '2017-10-14T16:15:19.506Z',
    creditcards: [ 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72' ],
    firstname: 'Rama',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    address:{
      zip: '97213',
      country: 'US',
      state: 'Oregon',
      city: 'London',
      line1: '10 Downing St.'
    },
    id: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    email: 'rama@damunaste.org',
    phone: '1234567890'
  };
}

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
          expect(error.message).to.have.string('[500] One or more validation errors occured:');
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

      associated_transactions[1].amount = 14.99;
      associated_transactions[0].amount = 9.99;

      registerController.parameters.set('hydrated_transaction', transaction);

      return registerController.executeReverse().then(() => {

        let response = registerController.parameters.get('processor_response');

        expect(response).to.have.property('message');
        expect(response).to.have.property('code');
        expect(response).to.have.property('result');

      });

    });

  });

  describe('executeProcess', () => {

    it('successfully executes a process', () => {

      let fake = class Process {

        constructor(){

        }

        process(){

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

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), fake);

      let registerController = new RegisterController();

      let customer = getValidCustomer();
      let productschedule = getValidProductSchedules().pop();
      let amount = getValidAmount();

      registerController.parameters.set('productschedule', productschedule);
      registerController.parameters.set('customer', customer);
      registerController.parameters.set('amount', amount);

      return registerController.executeProcess().then(() => {

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

  describe('validateRebillTimestamp', () => {

    it('successfully validates a rebill timestamp', () => {

      let valid_rebill = getValidRebill();

      let registerController = new RegisterController();

      registerController.parameters.set('rebill', valid_rebill);

      return registerController.validateRebillTimestamp().then(result => {
        expect(result).to.equal(true);
      });

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

        registerController.setDependencies();

        return registerController.acquireRebillProperties().then(result => {

          expect(result).to.equal(true);

          //let transactions = processBillingController.parameters.get('transactions');
          let productschedules = registerController.parameters.get('productschedules');
          let parentsession = registerController.parameters.get('parentsession');

        });

      });

    });

    describe('validateSession', () => {

      it('successfully validates a parent session', () => {

        let parent_session = getValidParentSession();

        let registerController = new RegisterController();

        registerController.parameters.set('parentsession', parent_session);

        registerController.setDependencies();

        return registerController.validateSession().then(result => {

          expect(result).to.equal(true);

        });

      });

    });

    describe('acquireProducts', () => {

      it('successfully acquires products', () => {

        let parent_session = getValidParentSession();
        let product_schedules = getValidProductSchedules();

        let registerController = new RegisterController();

        registerController.parameters.set('parentsession', parent_session);
        registerController.parameters.set('productschedules', product_schedules);

        registerController.setDependencies();

        return registerController.acquireProducts().then(result => {

          expect(result).to.equal(true);
          let transaction_products = registerController.parameters.get('transactionproducts');

          expect(transaction_products).to.be.defined;
          expect(arrayutilities.nonEmpty(transaction_products)).to.equal(true);

        });

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
          },
          calculateDayInCycle: (session_start) => {

            du.debug('Calculate Day In Cycle');

            return timestamp.getDaysDifference(session_start);

          }
        });

        let rebill = getValidRebill();
        let parentsession = getValidParentSession();

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', rebill);
        registerController.parameters.set('parentsession', parentsession);

        registerController.setDependencies();

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
        let productschedules = getValidProductSchedules();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
          getCreditCards:(customer) => {
            return Promise.resolve(getValidCreditCards());
          },
          get:({id}) => {
            return Promise.resolve(getValidCustomer());
          }
        });

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', rebill);
        registerController.parameters.set('parentsession', parentsession);
        registerController.parameters.set('productschedules', productschedules);

        registerController.setDependencies();

        return registerController.acquireRebillSubProperties().then(result => {

          expect(result).to.equal(true);

          let creditcards = registerController.parameters.get('creditcards');
          let customer = registerController.parameters.get('customer');
          let transactionproducts = registerController.parameters.get('transactionproducts');

          expect(creditcards).to.be.defined;
          expect(customer).to.be.defined;
          expect(transactionproducts).to.be.defined;

        });

      });

    });

});
