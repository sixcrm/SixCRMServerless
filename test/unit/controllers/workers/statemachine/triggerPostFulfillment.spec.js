const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/triggerPostFulfillment.js', async () => {

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

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      expect(objectutilities.getClassName(triggerPostFulfillmentController)).to.equal('TriggerPostFulfillmentController');

    });

  });

  describe('getShippingReceipts', async () => {

    it('successfully acquires shipping receipts', async () => {

      let rebill = MockEntities.getValidRebill();
      let shipping_receipts = [
        MockEntities.getValidShippingReceipt(),
        MockEntities.getValidShippingReceipt(),
        MockEntities.getValidShippingReceipt()
      ]

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
        constructor(){}
        getShippingReceipts({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(shipping_receipts);
        }
      });

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      let result = await triggerPostFulfillmentController.getShippingReceipts(rebill);

      expect(result).to.be.a('array');
      expect(result.length).to.equal(3);

    });

  });

  describe('triggerPostFulfillment', async () => {

    it('successfully triggers the Postfulfillment state machine', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'statemachine/StateMachine.js'), class{
        constructor(){}
        startExecution(parameters){
          expect(parameters).to.have.property('stateMachineName');
          expect(parameters).to.have.property('input');
          expect(parameters.stateMachineName).to.equal('Postfulfillment');
          expect(parameters.input).to.have.property('guid');
          expect(parameters.input.guid).to.equal(shipping_receipt.id);
          return Promise.resolve({
            executionArn:'SomeArn',
            startDate:timestamp.getISO8601()
          });
        }
      });

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      let result = await triggerPostFulfillmentController.triggerPostFulfillment(shipping_receipt);
      expect(result).to.have.property('executionArn');
      expect(result).to.have.property('startDate');

    });

    it('throws an error (no "id" property)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      delete shipping_receipt.id;

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      try{
        let result = triggerPostFulfillmentController.triggerPostFulfillment(shipping_receipt);
        expect(false).to.equal(true, 'This should have thrown an error');
      }catch(error){
        expect(error.message).to.equal('[500] Expected Shipping Receipt to have property "id".')
      }

    });

    it('throws an error (non UUID "id" property)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      shipping_receipt.id = 'non-uuid';

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      try{
        let result = triggerPostFulfillmentController.triggerPostFulfillment(shipping_receipt);
        expect(false).to.equal(true, 'This should have thrown an error');
      }catch(error){
        expect(error.message).to.equal('[500] Expected Shipping Receipt ID to be a UUID.')
      }

    });

  });

  describe('execute', async () => {

    it('successfully triggers the postfulfillment state machine', async () => {

      let rebill = MockEntities.getValidRebill();
      const event = {
        guid: rebill.id
      };

      let shipping_receipts = [
        MockEntities.getValidShippingReceipt(),
        MockEntities.getValidShippingReceipt(),
        MockEntities.getValidShippingReceipt()
      ]

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
        constructor(){}
        getShippingReceipts({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(shipping_receipts);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'statemachine/StateMachine.js'), class{
        constructor(){}
        startExecution(parameters){
          expect(parameters).to.have.property('stateMachineName');
          expect(parameters).to.have.property('input');
          expect(parameters.stateMachineName).to.equal('Postfulfillment');
          expect(parameters.input).to.have.property('guid');
          return Promise.resolve({
            executionArn:'SomeArn',
            startDate:timestamp.getISO8601()
          });
        }
      });

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      let response = await triggerPostFulfillmentController.execute(event);
      expect(response).to.be.a('array');
      expect(response.length).to.equal(3);
      arrayutilities.map(response, trigger_response => {
        expect(trigger_response).to.have.property('executionArn');
        expect(trigger_response).to.have.property('startDate');
      });

    });

    it('throws an error when there are no shipping receipts', async () => {

      let rebill = MockEntities.getValidRebill();
      const event = {
        guid: rebill.id
      };

      let shipping_receipts = []

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
        constructor(){}
        getShippingReceipts({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(shipping_receipts);
        }
      });

      const TriggerPostFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggerPostFulfillment.js');
      let triggerPostFulfillmentController = new TriggerPostFulfillmentController();

      try{

        let response = await triggerPostFulfillmentController.execute(event);
        expect(false).to.equal(true, "An error should have been thrown.");

      }catch(error){

        expect(error.message).to.have.string('[500] There are no shipping receipts associated with the rebill ID');

      }


    });

  });


});
