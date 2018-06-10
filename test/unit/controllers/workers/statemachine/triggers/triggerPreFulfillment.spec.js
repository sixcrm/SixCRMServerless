const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/triggers/triggerPreFulfillment.js', () => {

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

      const TriggerPreFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggers/triggerPreFulfillment.js');
      let triggerPreFulfillmentController = new TriggerPreFulfillmentController();

      expect(objectutilities.getClassName(triggerPreFulfillmentController)).to.equal('TriggerPreFulfillmentController');

    });

  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      const parameters = {
        guid: shipping_receipt.id,
        stateMachineName: 'Billing'
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'statemachine/StateMachine.js'), class {
        constructor(){}
        startExecution({parameters}){
          expect(parameters).to.be.a('object');
          expect(parameters).to.have.property('stateMachineName');
          expect(parameters.stateMachineName).to.equal('Prefulfillment');
          expect(parameters).to.have.property('input');
          expect(parameters.input).to.be.a('object');
          expect(parameters.input).to.have.property('guid');
          expect(parameters.input.guid).to.be.a('string');
          expect(stringutilities.isUUID(parameters.input.guid)).to.equal(true);
          return Promise.resolve({
            executionArn: 'arn:aws:states:us-east-1:068070110666:execution:Closesession:053b54ce-6cd1-4952-8e3e-3eb137cd5a30@1528304510000',
            startDate: '2018-06-06T17:01:51.593Z'
          });
        }
        getRunningExecutions({id, state}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      const TriggerPreFulfillmentController = global.SixCRM.routes.include('workers', 'statemachine/triggers/triggerPreFulfillment.js');
      let triggerPreFulfillmentController = new TriggerPreFulfillmentController();

      let result = await triggerPreFulfillmentController.execute({parameters: parameters});

      expect(result).to.be.a('object')
      expect(result).to.have.property('executionArn');
      expect(result).to.have.property('startDate');

    });

  });

});
