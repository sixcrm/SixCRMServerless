'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
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
    "result":"success",
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };

}

function getValidRegisterResponse(){

  const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');

  return new RegisterResponse({
    response_type: 'success',
    transaction: getValidTransaction(),
    processor_response: getValidProcessorResponse()
  });

}

function getValidMessages(){

  let a_message = {
    MessageId:"someMessageID",
    ReceiptHandle:"SomeReceiptHandle",
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"}),
    MD5OfBody:"SomeMD5"
  };

  return [
    {
      MessageId:"someMessageID",
      ReceiptHandle:"SomeReceiptHandle",
      Body: JSON.stringify({id:uuidV4()}),
      MD5OfBody:"SomeMD5"
    },
    {
      MessageId:"someMessageID",
      ReceiptHandle:"SomeReceiptHandle",
      Body: JSON.stringify({id:uuidV4()}),
      MD5OfBody:"SomeMD5"
    }
  ];

}

function getValidEvents(){

  let a_event = {
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"})
  };

  return [a_event, JSON.stringify(a_event)];

}

function getValidRebill(){

  return {
    bill_at: "2017-04-06T18:40:41.405Z",
    id: "70de203e-f2fd-45d3-918b-460570338c9b",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    parentsession: "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
    product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
    amount: 79.99,
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

}

describe('controllers/workers/recoverBilling', () => {

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

    it('instantiates the recoverBillingController class', () => {

      const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
      let recoverBillingController = new RecoverBillingController();

      expect(objectutilities.getClassName(recoverBillingController)).to.equal('recoverBillingController');

    });

  });

  describe('markRebill', () => {

    it('successfully marks and updates a rebill.', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
      let recoverBillingController = new RecoverBillingController();

      recoverBillingController.parameters.set('rebill', rebill);
      recoverBillingController.parameters.set('registerresponsecode', 'fail');

      return recoverBillingController.markRebill().then(result => {
        expect(result).to.equal(true);
        expect(recoverBillingController.parameters.store['rebill'].second_attempt).to.equal(true);
      })
    });

    it('skips updating a rebill. (success)', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
      let recoverBillingController = new RecoverBillingController();

      recoverBillingController.parameters.set('rebill', rebill);
      recoverBillingController.parameters.set('registerresponsecode', 'success');

      return recoverBillingController.markRebill().then(result => {
        expect(result).to.equal(true);
        expect(recoverBillingController.parameters.store['rebill'].second_attempt).to.equal(undefined);
      })
    });

    it('skips updating a rebill. (error)', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
      let recoverBillingController = new RecoverBillingController();

      recoverBillingController.parameters.set('rebill', rebill);
      recoverBillingController.parameters.set('registerresponsecode', 'error');

      return recoverBillingController.markRebill().then(result => {
        expect(result).to.equal(true);
        expect(recoverBillingController.parameters.store['rebill'].second_attempt).to.equal(undefined);
      })
    });


  });

  describe('process', () => {

    it('successfully processes a transaction', () => {

      let rebill = getValidRebill();
      let response_code = 'success';

      let register_mock = class Register {
        constructor(){

        }
        processTransaction({customer, productschedule, amount}){
          return Promise.resolve(getValidRegisterResponse());
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), register_mock);

      const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
      let recoverBillingController = new RecoverBillingController();

      recoverBillingController.parameters.set('rebill', rebill);

      return recoverBillingController.process().then(result => {

        expect(result).to.equal(true);
        expect(recoverBillingController.parameters.store['registerresponsecode']).to.equal(response_code);

      });

    });

  });

  describe('execute', () => {

    it('successfully executes', () => {

      let rebill = getValidRebill();
      let register_response = getValidRegisterResponse();
      let response_code = 'success';

      let register_mock = class Register {
        constructor(){

        }
        processTransaction({customer, productschedule, amount}){
          return Promise.resolve(register_response);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), register_mock);
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get: ({id}) => {
          return Promise.resolve(rebill)
        }
      });

      let message = getValidMessages()[0];
      const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
      let recoverBillingController = new RecoverBillingController();

      return recoverBillingController.execute(message).then(result => {
        expect(recoverBillingController.parameters.store['registerresponsecode']).to.equal(response_code);
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(result.getCode()).to.equal('success');
      });
    });
  });

});
