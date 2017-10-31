'use strict'
const _ = require('underscore');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

function getValidEvents(){

  let a_event = {
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"})
  };

  return [a_event, JSON.stringify(a_event)];

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

  describe('processBilling', () => {

    it('successfully processes rebill', () => {

    });

  });

});
