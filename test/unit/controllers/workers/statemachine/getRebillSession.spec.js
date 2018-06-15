const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getRebillSession.js', () => {

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

      const GetRebillSessionController = global.SixCRM.routes.include('workers', 'statemachine/getRebillSession.js');
      let getRebillSessionController = new GetRebillSessionController();

      expect(objectutilities.getClassName(getRebillSessionController)).to.equal('GetRebillSessionController');

    });

  });

  describe('execute', async () => {

    it('successfully retrieves the session id (session argument present)', async () => {

      const rebill = MockEntities.getValidRebill();
      const session = MockEntities.getValidSession();

      let event = {
        guid: rebill.id,
        session: session.id
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetRebillSessionController = global.SixCRM.routes.include('workers', 'statemachine/getRebillSession.js');
      let getRebillSessionController = new GetRebillSessionController();

      let result = await getRebillSessionController.execute(event);
      expect(result).to.equal(session.id)

    });

    it('successfully retrieves the session id (session argument not present)', async () => {

      const session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      let event = {
        guid: rebill.id,
        session: session.id
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          expect(id).to.equal(session.id);
          return Promise.resolve(session);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          expect(id).to.equal(rebill.id);
          return Promise.resolve(rebill);
        }
      });

      const GetRebillSessionController = global.SixCRM.routes.include('workers', 'statemachine/getRebillSession.js');
      let getRebillSessionController = new GetRebillSessionController();

      let result = await getRebillSessionController.execute(event);
      expect(result).to.equal(session.id)

    })

  });

});
