const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

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

  describe('respond', () => {

    it('returns the consolidated rebill id', () => {

      let rebill = MockEntities.getValidRebill();

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = cleanupSessionController.respond(rebill);
      expect(result).to.equal(rebill.id);

    });

    it('returns "NOREBILL"', () => {

      let rebill = null;

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = cleanupSessionController.respond(rebill);
      expect(result).to.equal('NOREBILL');

    });

  });

  describe('getSessionRebills', async () => {

    it('returns the session rebills', async () => {

      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve({rebills: rebills});
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.getSessionRebills(session);
      expect(result).to.deep.equal(rebills);

    });

    it('throws an error (bad structure)', async () => {

      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve(rebills);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      try{
        await cleanupSessionController.getSessionRebills(session);
        expect(false).to.equal(true, 'Method should not have executed');
      }catch(error){
        expect(error.message).to.have.string('[500] Unexpected response format: ');
      }

    });

    it('returns null (bad structure)', async () => {

      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve(rebills);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.getSessionRebills(session, false);
      expect(result).to.equal(null);

    });

    it('returns null (empty array)', async () => {

      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve({rebills: []});
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.getSessionRebills(session, false);
      expect(result).to.equal(null);

    });

    it('returns null (null)', async () => {

      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve({rebills: null});
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.getSessionRebills(session, false);
      expect(result).to.equal(null);

    });

  });

  describe('consolidateTransactions', async () => {

    it('successfully updates transactions', async () => {

      let consolidated_rebill = MockEntities.getValidRebill();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = consolidated_rebill.parentsession;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: MockEntities.getValidTransactions()});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.consolidateTransactions({consolidated_rebill: consolidated_rebill, rebills: rebills});
      expect(result).to.equal(true);

    });

    it('successfully updates transactions where there are none (null)', async () => {

      let consolidated_rebill = MockEntities.getValidRebill();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = consolidated_rebill.parentsession;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: null});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.consolidateTransactions({consolidated_rebill: consolidated_rebill, rebills: rebills});
      expect(result).to.equal(true);

    });

    it('successfully updates transactions where there are none (empty array)', async () => {

      let consolidated_rebill = MockEntities.getValidRebill();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = consolidated_rebill.parentsession;
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: []});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.consolidateTransactions({consolidated_rebill: consolidated_rebill, rebills: rebills});
      expect(result).to.equal(true);

    });

  });

  describe('consolidateRebillTransactions', async () => {

    it('successfully updates transactions ', async () => {

      let consolidated_rebill = MockEntities.getValidRebill();
      let rebill = MockEntities.getValidRebill();
      rebill.session = consolidated_rebill.parentsession;

      let transactions = MockEntities.getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: transactions});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.consolidateRebillTransactions({consolidated_rebill: consolidated_rebill, rebill: rebill});
      expect(result).to.equal(true);

    });

  });

  describe('consolidateRebills', async () => {

    it('successfully consolidates the rebills', async () => {

      let consolidated_rebill_id = MockEntities.getValidRebill().id;
      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        create({entity}){
          expect(entity).to.be.a('object');
          entity.id = consolidated_rebill_id;
          return Promise.resolve(entity);
        }
        delete({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(id);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: MockEntities.getValidTransactions()});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.consolidateRebills({session: session, rebills: rebills});
      expect(result).to.have.property('id');
      expect(result).to.have.property('parentsession');
      expect(result.parentsession).to.equal(session.id);
      expect(result.id).to.equal(consolidated_rebill_id);

    });

    it('successfully consolidates the rebills (single rebill)', async () => {

      let consolidated_rebill_id = MockEntities.getValidRebill().id;
      let session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;
      rebills = [rebill];

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        create({entity}){
          expect(entity).to.be.a('object');
          entity.id = consolidated_rebill_id;
          return Promise.resolve(entity);
        }
        delete({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(id);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: MockEntities.getValidTransactions()});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.consolidateRebills({session: session, rebills: rebills});
      expect(result).to.have.property('id');
      expect(result).to.have.property('parentsession');
      expect(result.parentsession).to.equal(session.id);
      expect(result.id).to.equal(rebill.id);

    });

  });

  describe('cleanupSession', async () => {

    it('successfully cleans up the session', async () => {

      let consolidated_rebill_id = MockEntities.getValidRebill().id;
      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve({rebills: rebills});
        }
        create({entity}){
          expect(entity).to.be.a('object');
          entity.id = consolidated_rebill_id;
          return Promise.resolve(entity);
        }
        delete({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(id);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: MockEntities.getValidTransactions()});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.cleanupSession(session);
      expect(result).to.have.property('id');
      expect(result).to.have.property('parentsession');
      expect(result.parentsession).to.equal(session.id);
      expect(result.id).to.equal(consolidated_rebill_id);

    });

  });

  describe('execute', async () => {

    it('successfully cleans up the session', async () => {

      let consolidated_rebill_id = MockEntities.getValidRebill().id;
      let session = MockEntities.getValidSession();
      let rebills = arrayutilities.map(MockEntities.getValidRebills(), (rebill) => {
        rebill.parentsession = session.id
        return rebill;
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        listBySession({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          return Promise.resolve({rebills: rebills});
        }
        create({entity}){
          expect(entity).to.be.a('object');
          entity.id = consolidated_rebill_id;
          return Promise.resolve(entity);
        }
        delete({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(id);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        listTransactionsByRebillID(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: MockEntities.getValidTransactions()});
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
				}
				updateProperties() {
					return Promise.resolve();
				}
      });

      const CleanupSessionController = global.SixCRM.routes.include('workers', 'statemachine/cleanupSession.js');
      let cleanupSessionController = new CleanupSessionController();

      let result = await cleanupSessionController.execute({guid: session.id});
      expect(result).to.equal(consolidated_rebill_id);

    });

  });

});
