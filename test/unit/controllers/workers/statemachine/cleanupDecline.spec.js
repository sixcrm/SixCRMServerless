const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/cleanupDecline.js', () => {

  before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

  describe('constructor', () => {

    it('successfully constructs', () => {

      const CleanupDeclineController = global.SixCRM.routes.include('workers', 'statemachine/cleanupDecline.js');
      let cleanupDeclineController = new CleanupDeclineController();

      expect(objectutilities.getClassName(cleanupDeclineController)).to.equal('CleanupDeclineController');

    });

  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let rebill = MockEntities.getValidRebill();

      const CleanupDeclineController = global.SixCRM.routes.include('workers', 'statemachine/cleanupDecline.js');
      let cleanupDeclineController = new CleanupDeclineController();

      let result = await cleanupDeclineController.execute({guid: rebill.id});
      expect(result).to.equal(true);
      
    });

  });

});
