const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/concludeSession.js', () => {

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

      const ConcludeSessionController = global.SixCRM.routes.include('workers', 'statemachine/concludeSession.js');
      let concludeSessionController = new ConcludeSessionController();

      expect(objectutilities.getClassName(concludeSessionController)).to.equal('ConcludeSessionController');

    });

  });

  describe('execute', async () => {

    it('successfully concludes the session', async () => {

      let session = MockEntities.getValidSession();
      delete session.concluded;

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
          expect(entity).to.have.property('concluded');
          expect(entity.concluded).to.equal(true);
          return Promise.resolve(entity);
        }
      });

      const ConcludeSessionController = global.SixCRM.routes.include('workers', 'statemachine/concludeSession.js');
      let concludeSessionController = new ConcludeSessionController();

      let result = await concludeSessionController.execute({guid: session.id});
      expect(result).to.equal('CONCLUDED');

    });

  });

});
