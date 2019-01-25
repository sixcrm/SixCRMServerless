const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/triggers/triggerTracking.js', () => {

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

      const TriggerTrackingController = global.SixCRM.routes.include('workers', 'statemachine/triggers/triggerTracking.js');
      let triggerTrackingController = new TriggerTrackingController();

      expect(objectutilities.getClassName(triggerTrackingController)).to.equal('TriggerTrackingController');

    });

  });

  xdescribe('execute', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      const parameters = {
        guid: shipping_receipt.id
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'statemachine/StateMachine.js'), class {
        constructor(){}
        startExecution(parameters){
          expect(parameters).to.be.a('object');
          expect(parameters).to.have.property('stateMachineName');
          expect(parameters.stateMachineName).to.equal('Tracking');
          expect(parameters).to.have.property('input');
          expect(parameters.input).to.be.a('string');
          expect(JSON.parse(parameters.input)).to.have.property('guid');
          expect(JSON.parse(parameters.input).guid).to.be.a('string');
          expect(stringutilities.isUUID(JSON.parse(parameters.input).guid)).to.equal(true);
          return Promise.resolve({
            executionArn: 'arn:aws:states:us-east-1:068070110666:execution:Closesession:053b54ce-6cd1-4952-8e3e-3eb137cd5a30@1528304510000',
            startDate: '2018-06-06T17:01:51.593Z'
          });
        }
      });

      const TriggerTrackingController = global.SixCRM.routes.include('workers', 'statemachine/triggers/triggerTracking.js');
      let triggerTrackingController = new TriggerTrackingController();

      let result = await triggerTrackingController.execute(parameters);
      expect(result).to.be.a('object')
      expect(result).to.have.property('executionArn');
      expect(result).to.have.property('startDate');

    });

  });

});
