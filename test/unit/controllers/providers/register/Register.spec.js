'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');


function getValidProcessReceipt(){

  return {};

}

function getValidProcessResponse(){

  return {
    code:'success',
    message:'Success',
    merchant_provider: getValidMerchantProvider().id,
    result: {}
  };

}

function getValidTransactionProducts(){

  return [{
    "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
    "amount":34.99
  }];

}

function getValidMerchantProvider(){

  return {
    id:"6c40761d-8919-4ad6-884d-6a46a776cfb9",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    name:"NMI Account 1",
    processor:{
      name:"NMA",
      id:"someIDValue"
    },
    processing:{
      monthly_cap: 50000.00,
      discount_rate:0.9,
      transaction_fee:0.06,
      reserve_rate: 0.5,
      maximum_chargeback_ratio:0.17,
      transaction_counts:{
        daily:30,
        monthly:30,
        weekly:30
      }
    },
    enabled:true,
    gateway: {
      name:"NMI",
      username:"demo",
      password:"password",
    },
    allow_prepaid:true,
    accepted_payment_methods:["Visa", "Mastercard", "American Express"],
    customer_service:{
      email:"customer.service@mid.com",
      url:"http://mid.com",
      description:"Some string here..."
    },
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

}

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
    "result":"success",
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
    "result":"success",
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
    "result":"success",
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
          let associated_transaction = registerController.parameters.get('associatedtransaction');

          expect(associated_transaction).to.deep.equal(expected_transaction);

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
          let associated_transaction = registerController.parameters.get('associatedtransaction');

          expect(associated_transaction).to.deep.equal(expected_transaction);

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

      registerController.parameters.set('associatedtransaction', transaction_object);

      return registerController.getAssociatedTransactions().then(() => {
        let associatedtransactions = registerController.parameters.get('associated_transactions');

        expect(associatedtransactions).to.deep.equal(getValidAssociatedTransactions());
      });

    });

  });

  describe('validateAssociatedTransactions', () => {

      it('returns error when transaction with pre-existing refunds/reversals can\'t be reversed', (done) => {

          let registerController = new RegisterController();

          let associated_transactions = getValidAssociatedTransactions();

          registerController.parameters.set('associated_transactions', associated_transactions);

          try{
            registerController.validateAssociatedTransactions();
          }catch(error){
              expect(error.message).to.equal('[403] A transaction with pre-existing refunds or reversals can not be reversed.');
              done()
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

      let reversed_amount = registerController.calculateReversedAmount(associated_transactions);

      expect(reversed_amount).to.equal(48.21)

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

      associated_transactions[1].amount = 0.00;
      associated_transactions[0].amount = 0.00;

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

      associated_transactions[1].amount = 14.99;
      associated_transactions[0].amount = 9.99;

      registerController.parameters.set('associatedtransaction', transaction);

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

      registerController.parameters.set('associatedtransaction', transaction);

      registerController.parameters.set('amount', 10.00);

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

      associated_transactions[1].amount = 14.99;
      associated_transactions[0].amount = 9.99;

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

        let response = registerController.parameters.get('processorresponse');

        expect(response).to.have.property('message');
        expect(response).to.have.property('code');
        expect(response).to.have.property('result');

      });

    });

  });

  describe('issueReceipt', () => {

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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

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

    xit('returns null when creation of transaction was unsuccessful', () => {

        assumePermissionedRole();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'dynamodb-utilities.js'), {
          queryRecords: (table, parameters, index, callback) => {
            return Promise.resolve([]);
          },
          saveRecord: (tableName, entity, callback) => {
            return new Error();
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

        let registerController = new RegisterController();

        registerController.parameters.set('rebill', getValidRebill());
        registerController.parameters.set('amount', getValidAmount());
        registerController.parameters.set('transactiontype', 'sale');
        registerController.parameters.set('merchantprovider', getValidMerchantProvider());
        registerController.parameters.set('transactionproducts', getValidTransactionProducts());

        let processor_response = getProcessorResponseObject();

        processor_response.code = 'error';
        registerController.parameters.set('processorresponse', processor_response);

        return registerController.issueReceipt().then(result => {
          expect(result).to.equal(null);
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

      it('returns error when session has invalid day in cycle', () => {

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
            calculateDayInCycle: (session_start) => {
                return -1; //any negative number
            }
        });

        let parent_session = getValidParentSession();

        let registerController = new RegisterController();

        registerController.parameters.set('parentsession', parent_session);

        registerController.setDependencies();

        try{
          registerController.validateSession()
        }catch(error){
            expect(error.message).to.equal('[500] Invalid day in cycle returned for session.');
        }

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

    describe('transformResponse', () => {

      it('successfully responds to success', () => {

        let registerController = new RegisterController();

        registerController.parameters.set('receipttransaction', getValidTransactionObject());
        registerController.parameters.set('processorresponse', getProcessorResponseObject());

        return registerController.transformResponse().then(response => {

          expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
          expect(response.getCode()).to.equal('success');
          expect(response.getTransaction()).to.deep.equal(getValidTransactionObject());
          expect(response.getProcessorResponse()).to.deep.equal(getProcessorResponseObject());

        });

      });

      it('successfully responds to decline', () => {

        let processor_response = getProcessorResponseObject();

        processor_response.code = 'declined';

        let declined_transaction = getValidTransactionObject();

        declined_transaction.result = 'declined';

        let registerController = new RegisterController();

        registerController.parameters.set('receipttransaction', declined_transaction);
        registerController.parameters.set('processorresponse', processor_response);

        return registerController.transformResponse().then(response => {

          expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
          expect(response.getCode()).to.equal('fail');
          expect(response.getTransaction()).to.deep.equal(declined_transaction);
          expect(response.getProcessorResponse()).to.deep.equal(processor_response);

        });

      });

      it('successfully responds to error', () => {

        let processor_response = getProcessorResponseObject();

        processor_response.code = 'error';

        let error_transaction = getValidTransactionObject();

        error_transaction.result = 'error';

        let registerController = new RegisterController();

        registerController.parameters.set('receipttransaction', error_transaction);
        registerController.parameters.set('processorresponse', processor_response);

        return registerController.transformResponse().then(response => {

          expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
          expect(response.getCode()).to.equal('error');
          expect(response.getTransaction()).to.deep.equal(error_transaction);
          expect(response.getProcessorResponse()).to.deep.equal(processor_response);

        });

      });

    });

    describe('processTransaction', () => {

      it('successfully processes a transaction', () => {

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

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listProductSchedules: (rebill) => {
            return Promise.resolve(getValidProductSchedules());
          },
          getParentSession: (rebill) => {
            return Promise.resolve(getValidParentSession())
          },
          calculateDayInCycle: (session_start) => {
            return timestamp.getDaysDifference(session_start);
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

        mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
          addToSearchIndex: (entity) => {
            return entity;
          }
        });

        PermissionTestGenerators.givenUserWithAllowed('*', '*');

        let valid_rebill = getValidRebill();

        let registerController = new RegisterController();

        return registerController.processTransaction({rebill: valid_rebill}).then(result => {

          expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

        });

      });

    });

    describe('reverseTransaction', () => {

      it('successfully reverses a transaction', () => {

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

        mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
          addToSearchIndex: (entity) => {
            return entity;
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

      it('successfully reverses a transaction', () => {

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

        mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
          addToSearchIndex: (entity) => {
            return entity;
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

});
