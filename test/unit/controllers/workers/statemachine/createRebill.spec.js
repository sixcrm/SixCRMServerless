const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/createRebill.js', () => {

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

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      expect(objectutilities.getClassName(createRebillController)).to.equal('CreateRebillController');

    });

  });

  describe('respond', async () => {

    it('responds REBILLCREATED', async () => {

      const rebill = MockEntities.getValidRebill();

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = createRebillController.respond(rebill);
      expect(result).to.equal('REBILLCREATED');

    });

    it('responds CONCLUDED', async () => {

      const rebill = true;

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = createRebillController.respond(rebill);
      expect(result).to.equal('CONCLUDED');

    });

    it('responds FAILED (null)', async () => {

      const rebill = null;

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = createRebillController.respond(rebill);
      expect(result).to.equal('FAILED');

    });

    it('responds FAILED (error)', async () => {

      const rebill = new Error();

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = createRebillController.respond(rebill);
      expect(result).to.equal('FAILED');

    });

  });

  describe('createRebill', async () => {

    it('returns a rebill', async () => {

      const session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          expect(session.id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = await createRebillController.createRebill(session);
      expect(result).to.deep.equal(rebill);

    });

    it('returns an error', async () => {

      const session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          expect(session.id).to.be.a('string');
          throw new Error('Who knows!');
        }
      });

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = await createRebillController.createRebill(session);
      expect(result).to.be.a('Error');

    });

    it('throws an error', async () => {

      const session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          expect(session.id).to.be.a('string');
          throw new Error('Who knows!');
        }
      });

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      try{
        await createRebillController.createRebill(session, true);
        expect(true).to.equal(false, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.equal('Who knows!');
      }

    });

  });

  describe('execute', async () => {

    it('successfully creates the rebill', async () => {

      const session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          expect(session.id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = await createRebillController.execute({guid: session.id});
      expect(result).to.equal('REBILLCREATED');

    });

    it('successfully creates the rebill', async () => {

      const session = MockEntities.getValidSession();
      let rebill = MockEntities.getValidRebill();
      rebill.parentsession = session.id;

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill({session}){
          expect(session).to.be.a('object');
          expect(session).to.have.property('id');
          expect(session.id).to.be.a('string');
          throw new Error('Poo');
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
      });

      const CreateRebillController = global.SixCRM.routes.include('workers', 'statemachine/createRebill.js');
      let createRebillController = new CreateRebillController();

      let result = await createRebillController.execute({guid: session.id});
      expect(result).to.equal('FAILED');

    });

  });

});
