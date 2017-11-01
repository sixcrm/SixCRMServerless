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

      processBillingController.parameters.set('rebill', getValidRebill());

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
  */

});
