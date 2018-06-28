const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getSessionRebill.js', () => {

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

      const GetSessionRebillController = global.SixCRM.routes.include('workers', 'statemachine/getSessionRebill.js');
      let getSessionRebillController = new GetSessionRebillController();

      expect(objectutilities.getClassName(getSessionRebillController)).to.equal('GetSessionRebillController');

    });

  });

  describe('execute', async () => {

    it('successfully retrieves the rebill id (rebill argument present)', async () => {

      let rebill = MockEntities.getValidRebill();
      let input = {
        stateMachineName: "Closesession",
        guid: "3e3f7bd4-344e-4754-b9d7-a1bb2860dff8",
        executionid: "fbf8d327a5209b88b70cd8651c02fb6608804174",
        status: "CLOSED",
        rebill: rebill.id
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      const GetSessionRebillController = global.SixCRM.routes.include('workers', 'statemachine/getSessionRebill.js');
      let getSessionRebillController = new GetSessionRebillController();

      let result = await getSessionRebillController.execute(input);
      expect(result).to.equal(input.rebill);

    });

    it('successfully retrieves the rebill id (rebill argument not present)', async () => {

      let session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      let input = {
        stateMachineName: "Closesession",
        guid: session.id,
        executionid: "fbf8d327a5209b88b70cd8651c02fb6608804174",
        status: "CLOSED"
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
        queryBySecondaryIndex({query_parameters, field, index_name, index_value}){
          expect(query_parameters).to.be.a('object');
          expect(field).to.be.a('string');
          expect(index_name).to.be.a('string');
          expect(index_value).to.be.a('string');
          return Promise.resolve({rebills: [rebill]});
        }
      });

      const GetSessionRebillController = global.SixCRM.routes.include('workers', 'statemachine/getSessionRebill.js');
      let getSessionRebillController = new GetSessionRebillController();

      let result = await getSessionRebillController.execute(input);
      expect(result).to.equal(rebill.id);

    });

  });

});
