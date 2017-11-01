'use strict'
const _ = require('underscore');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidProcessorResponse(){

  return {
    code:'success',
    message:'Success',
    result:{
      response:'1',
      responsetext:'SUCCESS',
      authcode:'123456',
      transactionid:'3448894418',
      avsresponse:'N',
      cvvresponse:'',
      orderid:'',
      type:'sale',
      response_code:'100'
    }
  };

}

function getValidTransaction(){

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

function getValidRegisterResponse(){
  return {
    transaction:getValidTransaction(),
    processor_response: getValidProcessorResponse()
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

function getValidTransactionProducts(){
  return [
    {
      amount: 79.99,
      product: '6d90346a-5547-454c-91fe-9d101a08f68f'
    }
  ];
}

function getValidAmount(){
  return 79.99;
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

function getValidEvents(){

  let a_event = {
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"})
  };

  return [a_event, JSON.stringify(a_event)];

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

describe('controllers/workers/processBilling', () => {

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

  describe('constructor', () => {

    it('instantiates the processBillingController class', () => {

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      expect(objectutilities.getClassName(processBillingController)).to.equal('processBillingController');

    });

  });

  describe('setParameters', () => {

    it('successfully sets parameters', () => {

      let valid_events = getValidEvents();

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      arrayutilities.map(valid_events, valid_event => {

        processBillingController.setParameters({argumentation: {event: valid_event}, action: 'execute'}).then(() => {
          let the_event = processBillingController.parameters.get('event');

          expect(the_event).to.equal(the_event);
        });

      });

    });

  });

  describe('validateRebillTimestamp', () => {

    it('successfully validates a rebill timestamp', () => {

      let valid_rebill = getValidRebill();

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('rebill', valid_rebill);

      return processBillingController.validateRebillTimestamp().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('validateAttemptRecord', () => {

    it('successfully validates a rebill against attempt record', () => {

      let valid_rebill = getValidRebill();

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('rebill', valid_rebill);

      return processBillingController.validateRebillTimestamp().then(result => {
        expect(result).to.equal(true);
      });

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

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('rebill', valid_rebill);

      return processBillingController.acquireRebillProperties().then(result => {

        expect(result).to.equal(true);

        //let transactions = processBillingController.parameters.get('transactions');
        let productschedules = processBillingController.parameters.get('productschedules');
        let parentsession = processBillingController.parameters.get('parentsession');

      });

    });

  });

  describe('validateSession', () => {

    it('successfully validates a parent session', () => {

      let parent_session = getValidParentSession();

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('parentsession', parent_session);

      return processBillingController.validateSession().then(result => {

        expect(result).to.equal(true);

      });

    });

  });

  describe('acquireProducts', () => {

    it('successfully acquires products', () => {

      let parent_session = getValidParentSession();
      let product_schedules = getValidProductSchedules();

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('parentsession', parent_session);
      processBillingController.parameters.set('productschedules', product_schedules);

      return processBillingController.acquireProducts().then(result => {

        expect(result).to.equal(true);
        let transaction_products = processBillingController.parameters.get('transactionproducts');

        expect(transaction_products).to.be.defined;
        expect(arrayutilities.nonEmpty(transaction_products)).to.equal(true);

      });

    });

  });

  describe('validateRebill', () => {

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

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('rebill', rebill);
      processBillingController.parameters.set('parentsession', parentsession);

      return processBillingController.validateRebillForProcessing().then(result => {

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

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('rebill', rebill);
      processBillingController.parameters.set('parentsession', parentsession);
      processBillingController.parameters.set('productschedules', productschedules);

      return processBillingController.acquireRebillSubProperties().then(result => {

        expect(result).to.equal(true);

        let creditcards = processBillingController.parameters.get('creditcards');
        let customer = processBillingController.parameters.get('customer');
        let transactionproducts = processBillingController.parameters.get('transactionproducts');

        expect(creditcards).to.be.defined;
        expect(customer).to.be.defined;
        expect(transactionproducts).to.be.defined;

      });

    });

  });

  //Technical Debt:  Incomplete
  describe('process', () => {

    it('successfully processes a transaction', () => {

      let register_mock = class Register {
        constructor(){

        }
        processTransaction({customer, productschedule, amount}){
          return Promise.resolve(getValidRegisterResponse());
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), register_mock);

      let processBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

      processBillingController.parameters.set('customer', getValidCustomer());
      //Technical Debt:  Multiple Product Schedules OK?
      processBillingController.parameters.set('productschedule', getValidProductSchedules().pop());
      processBillingController.parameters.set('transactionproducts', getValidTransactionProducts());
      processBillingController.parameters.set('amount', getValidAmount());

      return processBillingController.process().then(result => {
        expect(result).to.equal(true);

        let register_response = processBillingController.parameters.get('registerresponse');

        expect(register_response).to.deep.equal(getValidRegisterResponse())

      });

    });

  });

  /*
  Need tests:
  acquireRebill()
  acquireRebillSubProperties()
  */
});
