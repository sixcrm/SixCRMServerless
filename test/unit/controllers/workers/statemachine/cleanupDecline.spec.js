const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
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

	after(() => {
		mockery.disable();
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
