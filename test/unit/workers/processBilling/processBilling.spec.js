'use strict'
const _ = require('underscore');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

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
    "parentsession": "7b556e82-5a4c-4199-b8bc-0d86b3d8b47b",
    "product_schedules": ["2200669e-5e49-4335-9995-9c02f041d91b"],
    "amount": 23.99,
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

      PermissionTestGenerators.givenUserWithAllowed('*', '*');

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

});
