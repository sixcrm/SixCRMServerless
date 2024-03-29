const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getRecoverDate.js', () => {

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

      const GetRecoverDateController = global.SixCRM.routes.include('workers', 'statemachine/getRecoverDate.js');
      let getRecoverDateController = new GetRecoverDateController();

      expect(objectutilities.getClassName(getRecoverDateController)).to.equal('GetRecoverDateController');

    });

  });

  describe('execute', async () => {
    it('returns a recovery date', async () => {

      let rebill = MockEntities.getValidRebill();

      const GetRecoverDateController = global.SixCRM.routes.include('workers', 'statemachine/getRecoverDate.js');
      let getRecoverDateController = new GetRecoverDateController();

      let result = await getRecoverDateController.execute({guid: rebill.id});
      expect(stringutilities.isISO8601(result)).to.equal(true);

    });
  });

});
