const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');


describe('controllers/workers/statemachine/triggerTracking.js', async () => {

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

      const TriggerTrackingController = global.SixCRM.routes.include('workers', 'statemachine/triggerTracking.js');
      let triggerTrackingController = new TriggerTrackingController();

      expect(objectutilities.getClassName(triggerTrackingController)).to.equal('TriggerTrackingController');

    });

  });

  describe('execute', async () => {

    it('successfully triggers the tracking state machine', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      const event = {
        guid: shipping_receipt.id
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'statemachine/StateMachine.js'), class{
        constructor(){}
        startExecution(parameters){
          return Promise.resolve({
            executionArn:'SomeArn',
            startDate:timestamp.getISO8601()
          });
        }
      });

      const TriggerTrackingController = global.SixCRM.routes.include('workers', 'statemachine/triggerTracking.js');
      let triggerTrackingController = new TriggerTrackingController();

      let response = await triggerTrackingController.execute(event);
      expect(response).to.have.property('executionArn');
      expect(response).to.have.property('startDate');

    });

  });

  describe('execute', async () => {

    it('throws errors when bad events are issued', async () => {

      const event = {};

      const TriggerTrackingController = global.SixCRM.routes.include('workers', 'statemachine/triggerTracking.js');
      let triggerTrackingController = new TriggerTrackingController();

      try{
        let response = await triggerTrackingController.execute(event);
      }catch(error){
        expect(error.message).to.equal('[400] Expected property "guid" in the event object');
      }


    });

  });


});
