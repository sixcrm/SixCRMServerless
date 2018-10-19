const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getSessionClosed.js', () => {

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

      const GetSessionClosedController = global.SixCRM.routes.include('workers', 'statemachine/getSessionClosed.js');
      let getSessionClosedController = new GetSessionClosedController();

      expect(objectutilities.getClassName(getSessionClosedController)).to.equal('GetSessionClosedController');

    });

  });

  describe('execute', async () => {

    it('successfully executes (NOTCLOSED - not present)', async () => {

      let session = MockEntities.getValidSession();
      delete session.completed;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionClosedController = global.SixCRM.routes.include('workers', 'statemachine/getSessionClosed.js');
      let getSessionClosedController = new GetSessionClosedController();

      let result = await getSessionClosedController.execute({guid: session.id});
      expect(result).to.equal('NOTCLOSED');

    });

    it('successfully executes (NOTCLOSED - present, false)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = false;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionClosedController = global.SixCRM.routes.include('workers', 'statemachine/getSessionClosed.js');
      let getSessionClosedController = new GetSessionClosedController();

      let result = await getSessionClosedController.execute({guid: session.id});
      expect(result).to.equal('NOTCLOSED');

    });

    it('successfully executes (CLOSED)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = true;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionClosedController = global.SixCRM.routes.include('workers', 'statemachine/getSessionClosed.js');
      let getSessionClosedController = new GetSessionClosedController();

      let result = await getSessionClosedController.execute({guid: session.id});
      expect(result).to.equal('CLOSED');

    });

  });

});
