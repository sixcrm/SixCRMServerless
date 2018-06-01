const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/components/stepFunctionWorker.js', () => {

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

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      expect(objectutilities.getClassName(stepFunctionWorkerController)).to.equal('StepFunctionWorkerController');

    });

  });

  describe('validateEvent', () => {

    it('successfully validates a valid event', () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();
      const event = {guid: shipping_receipt.id};

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      let result = stepFunctionWorkerController.validateEvent(event);
      expect(result).to.deep.equal(event);

    });

    it('throws an error when the event is missing required properties', () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();
      const event = {};

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      try {
        stepFunctionWorkerController.validateEvent(event);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.equal('[400] Expected property "guid" in the event object');
      }

    });

    it('throws an error when the event has a property of incorrect type', () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();
      const event = {guid: 123};

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      try {
        stepFunctionWorkerController.validateEvent(event);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.equal('[400] Expected property "guid" to be a UUIDV4');
      }

    });

  });

  describe('getShippingReceipt', async () => {

    it('successfully returns a shipping receipt', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
      });

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      const result = await stepFunctionWorkerController.getShippingReceipt(shipping_receipt.id);
      expect(result).to.deep.equal(shipping_receipt);

    });

    it('throws an error when the shipping receipt is not found', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      try{
        await stepFunctionWorkerController.getShippingReceipt(shipping_receipt.id);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.have.string('[500] Unable to acquire a shipping receipt that matches');
      }

    });

    it('returns null when the shipping receipt is not found and fatal is false', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      let result = await stepFunctionWorkerController.getShippingReceipt(shipping_receipt.id, false);
      expect(result).to.equal(null);

    });

  });

  describe('getRebill', async () => {

    it('successfully returns a rebill', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      const result = await stepFunctionWorkerController.getRebill(rebill.id);
      expect(result).to.deep.equal(rebill);

    });

    it('throws an error when the rebill is not found', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      try{
        await stepFunctionWorkerController.getRebill(rebill.id);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.have.string('[500] Unable to acquire a rebill that matches');
      }

    });

    it('returns null when the rebill is not found and fatal is false', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      const StepFunctionWorkerController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionWorker.js');
      let stepFunctionWorkerController = new StepFunctionWorkerController();

      let result = await stepFunctionWorkerController.getRebill(rebill.id, false);
      expect(result).to.equal(null);

    });

  });

});
