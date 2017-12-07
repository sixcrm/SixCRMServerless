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

function getValidMessage(){

  return {
    MessageId:"someMessageID",
    ReceiptHandle:"SomeReceiptHandle",
    Body: JSON.stringify({id:uuidV4()}),
    MD5OfBody:"SomeMD5"
  };

}

function getValidRebill(){

  return {
    bill_at: timestamp.getISO8601(),
    id: uuidV4(),
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    parentsession: uuidV4(),
    product_schedules: [uuidV4(), uuidV4()],
    amount: 79.99,
    created_at:timestamp.getISO8601(),
    updated_at:timestamp.getISO8601()
  };

}

function getValidTerminalResponse(){

  const TerminalResponse = global.SixCRM.routes.include('providers', 'shipping/Response.js');

  return new TerminalResponse({
    response_type: 'success',
    rebill: getValidRebill(),
    provider_response: getValidProviderResponse()
  });

}

function getValidProviderResponse(){
  return '';
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

  describe('constructor', () => {

    it('successfully constructs', () => {

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      expect(objectutilities.getClassName(shipProductController)).to.equal('shipProductController');

    });

  });

  describe('ship', () => {

    it('successfully executes a rebill ship via shipping terminal', () => {

      let rebill = getValidRebill();
      let terminal_response = getValidTerminalResponse();

      let terminal_mock = class Terminal {
        constructor(){

        }
        shipRebill({rebill}){
          return Promise.resolve(terminal_response);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'shipping/Terminal.js'), terminal_mock);

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      shipProductController.parameters.set('rebill', rebill);

      return shipProductController.ship().then(result => {
        expect(result).to.equal(true);
        expect(shipProductController.parameters.store['terminalresponse']).to.equal(terminal_response);
      });

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      let terminal_response = getValidTerminalResponse();

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      shipProductController.parameters.set('terminalresponse', terminal_response);

      let response = shipProductController.respond();

      expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
      expect(response.getCode()).to.equal('success');

    });

  });

  describe('execute', () => {

    it('successfully executes', () => {

      let rebill = getValidRebill();
      let terminal_response = getValidTerminalResponse();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get:({id}) => {
          return Promise.resolve(rebill);
        }
      });

      let terminal_mock = class Terminal {
        constructor(){

        }
        shipRebill({rebill}){
          return Promise.resolve(terminal_response);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'shipping/Terminal.js'), terminal_mock);

      let message = getValidMessage();

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      return shipProductController.execute(message).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(shipProductController.parameters.store['terminalresponse']).to.equal(terminal_response);
        expect(result.getCode()).to.equal('success');
      });

    });

  });

});
