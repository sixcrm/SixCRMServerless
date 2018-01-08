'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

}

function getValidRebill(id){

  return MockEntities.getValidRebill(id);

}

function getValidTerminalResponse(){

  const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');

  return new TerminalResponse({
    response_type: 'success',
    rebill: getValidRebill(),
    provider_response: getValidProviderResponse()
  });

}

function getValidProviderResponse(){
  return {
    response:{},
    code:'success',
    message:'Success'
  };
}

describe('controllers/workers/shipProduct', function () {

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

  describe('execute', () => {

    it('successfully executes', () => {

      let message = getValidMessage('b21c969f-e6b4-460d-a57e-552b7b471027');

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      return shipProductController.execute(message).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(result.getCode()).to.equal('success');
      });

    });

  });

});
