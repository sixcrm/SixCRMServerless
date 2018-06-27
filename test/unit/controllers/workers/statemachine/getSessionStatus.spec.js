const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getSessionStatus.js', () => {

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

      const GetSessionStatusController = global.SixCRM.routes.include('workers', 'statemachine/getSessionStatus.js');
      let getSessionStatusController = new GetSessionStatusController();

      expect(objectutilities.getClassName(getSessionStatusController)).to.equal('GetSessionStatusController');

    });

  });

  describe('execute', async () => {

    it('successfully executes (ACTIVE)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = true;
      delete session.concluded;
      delete session.cancelled;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionStatusController = global.SixCRM.routes.include('workers', 'statemachine/getSessionStatus.js');
      let getSessionStatusController = new GetSessionStatusController();

      let result = await getSessionStatusController.execute({guid: session.id});
      expect(result).to.equal('ACTIVE');

    });

    it('successfully executes (INCOMPLETE)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = false;
      delete session.concluded;
      delete session.cancelled;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionStatusController = global.SixCRM.routes.include('workers', 'statemachine/getSessionStatus.js');
      let getSessionStatusController = new GetSessionStatusController();

      let result = await getSessionStatusController.execute({guid: session.id});
      expect(result).to.equal('INCOMPLETE');

    });

    it('successfully executes (CANCELLED)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = true;
      session.cancelled = {cancelled: true};
      delete session.concluded;


      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionStatusController = global.SixCRM.routes.include('workers', 'statemachine/getSessionStatus.js');
      let getSessionStatusController = new GetSessionStatusController();

      let result = await getSessionStatusController.execute({guid: session.id});
      expect(result).to.equal('CANCELLED');

    });

    it('successfully executes (CONCLUDED)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = true;
      delete session.cancelled;
      session.concluded = true;


      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const GetSessionStatusController = global.SixCRM.routes.include('workers', 'statemachine/getSessionStatus.js');
      let getSessionStatusController = new GetSessionStatusController();

      let result = await getSessionStatusController.execute({guid: session.id});
      expect(result).to.equal('CONCLUDED');

    });

  });

  xdescribe('execute (LIVE)', async () => {

    it('successfully executes (ACTIVE)', async () => {

      let session = MockEntities.getValidSession();
      session.completed = true;
      delete session.concluded;
      delete session.cancelled;

      /*
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });
      */

      const GetSessionStatusController = global.SixCRM.routes.include('workers', 'statemachine/getSessionStatus.js');
      let getSessionStatusController = new GetSessionStatusController();

      let result = await getSessionStatusController.execute({
        "stateMachineName": "Createrebill",
        "guid": "5cc1e0c7-555b-435d-9230-2626a55c965d",
        "executionid": "3cc18a0ffcba83d8776990e2555aadada4da6fdf"
      });

      expect(result).to.equal('ACTIVE');

    });

  });

});
