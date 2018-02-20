'use strict'

const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');



describe('controllers/workers/eventEmails', () => {

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

    it('instantiates the eventEmailsController class', () => {

      let eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/eventEmails.js');

      expect(objectutilities.getClassName(eventEmailsController)).to.equal('EventEmailsController');

    });

  });

  describe('execute', () => {
    it('successfully executes', () => {

      let event = MockEntities.getValidSNSMessage();

      let eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/eventEmails.js');

      return eventEmailsController.execute(event).then(result => {
        expect(result).to.equal(true);
      });
    });
  });

});
