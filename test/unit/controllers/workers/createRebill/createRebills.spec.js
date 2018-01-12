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

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidRebill(id){

  return MockEntities.getValidRebill(id);

}

function getValidSession(id){

  return MockEntities.getValidSession(id);

}

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

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
    //global.SixCRM.localcache.clear('all');
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
        createRebill(session){
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
        createRebill(session){
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
