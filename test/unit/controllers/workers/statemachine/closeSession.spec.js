const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/closeSession.js', () => {

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

      const CloseSessionController = global.SixCRM.routes.include('workers', 'statemachine/closeSession.js');
      let closeSessionController = new CloseSessionController();

      expect(objectutilities.getClassName(closeSessionController)).to.equal('CloseSessionController');

    });

  });

  describe('execute', async () => {

    it('successfully closes the session', async () => {

      let session = MockEntities.getValidSession();
      delete session.completed;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          entity.updated_at = timestamp.getISO8601();
          expect(entity).to.have.property('completed');
          expect(entity.completed).to.equal(true);
          return Promise.resolve(entity);
        }
      });

      const CloseSessionController = global.SixCRM.routes.include('workers', 'statemachine/closeSession.js');
      let closeSessionController = new CloseSessionController();

      let result = await closeSessionController.execute({guid: session.id});
      expect(result).to.equal('CLOSED');

    });

  });

});
