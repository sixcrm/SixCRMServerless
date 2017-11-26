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

function getValidSession(){

  return {
    completed: false,
    subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    created_at: '2017-04-06T18:40:41.405Z',
    subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
    subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
    subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    product_schedules: [ '12529a17-ac32-4e46-b05b-83862843055d' ],
    updated_at: '2017-04-06T18:41:12.521Z',
    affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
    id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
    cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
  };

}

function getValidMessage(){

  return {
    MessageId:"someMessageID",
    ReceiptHandle:"SomeReceiptHandle",
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"}),
    MD5OfBody:"SomeMD5"
  };

}

describe('controllers/workers/getRebills', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.resetCache();
    mockery.deregisterAll();
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('instantiates the createRebillsController class', () => {

      let createRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

      expect(objectutilities.getClassName(createRebillsController)).to.equal('createRebillsController');

    });

  });

  describe('acquireSession', () => {

    it('successfully acquires a session', () => {

      let session = getValidSession();
      let message = getValidMessage();

      message.Body = JSON.stringify({id: session.id});

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        get: ({id}) => {
          return Promise.resolve(session)
        }
      });

      let createRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

      createRebillsController.parameters.set('message', message);

      return createRebillsController.acquireSession().then(result => {
        expect(result).to.equal(true);
        expect(createRebillsController.parameters.store['session']).to.deep.equal(session);
      });

    });

  });

  describe('createRebills', () => {

    it('successfully creates rebills', () => {

      let session = getValidSession();
      let rebill = getValidRebill();

      let mock_rebill_helper_controller = class {
        constructor(){

        }
        createRebills(session){
          return Promise.resolve(rebill);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper_controller);

      let createRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

      createRebillsController.parameters.set('session', session);

      return createRebillsController.createRebills().then(result => {
        expect(result).to.equal(true);
        expect(createRebillsController.parameters.store['rebill']).to.deep.equal(rebill);
      });

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      let rebill = getValidRebill();

      let createRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

      createRebillsController.parameters.set('rebill', rebill);

      let result = createRebillsController.respond();

      expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');

    });

  });

  describe('execute', () => {

    it('successfully executes', () => {

      let session = getValidSession();
      let message = getValidMessage();
      let rebill = getValidRebill();

      message.Body = JSON.stringify({id: session.id});

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        get: ({id}) => {
          return Promise.resolve(session)
        }
      });

      let mock_rebill_helper_controller = class {
        constructor(){

        }
        createRebills(session){
          return Promise.resolve(rebill);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper_controller);

      let createRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

      return createRebillsController.execute(message).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(createRebillsController.parameters.store['session']).to.deep.equal(session);
        expect(createRebillsController.parameters.store['rebill']).to.deep.equal(rebill);
      });

    });

  });

});
