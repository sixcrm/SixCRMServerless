const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/cleanupSession.js', () => {

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

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      expect(objectutilities.getClassName(cleanupSessionController)).to.equal('CleanupSessionController');

    });

  });

  describe('execute', async () => {

    it('successfully cleans up the session', async () => {

      let session = MockEntities.getValidSession();
      session.completed = true;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.execute({guid: session.id});
      expect(result).to.equal(true);

    });

  });

});
