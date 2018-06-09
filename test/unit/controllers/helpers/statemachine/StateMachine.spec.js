const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/helpers/statemachine/StateMachine.js', () => {

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

      const StateMachineHelperController = global.SixCRM.routes.include('helpers', 'statemachine/StateMachine.js');
      let stateMachineHelperController = new StateMachineHelperController();

      expect(objectutilities.getClassName(stateMachineHelperController)).to.equal('StateMachineHelperController');

    });

  });

  xdescribe('getAccount', async () => {

    it('successfully acquires a shipping_receipt account', async () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();

      const event = {
        guid: shipping_receipt.id,
        account: shipping_receipt.account
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(false).to.equal(true, 'Method should not have executed.');
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(false).to.equal(true, 'Method should not have executed.');
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
        constructor(){}
        get({id}){
          expect(false).to.equal(true, 'Method should not have executed.');
        }
      });

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = await stepFunctionReporterController.getAccount(event);

      expect(result).to.equal(shipping_receipt.account);

    });

    it('successfully acquires a shipping_receipt account', async () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();

      const event = {
        guid: shipping_receipt.id
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.equal(shipping_receipt.id)
          return Promise.resolve(null);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.equal(shipping_receipt.id)
          return Promise.resolve(null);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.equal(shipping_receipt.id)
          return Promise.resolve(shipping_receipt);
        }
      });

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = await stepFunctionReporterController.getAccount(event);

      expect(result).to.equal(shipping_receipt.account);

    });

  });

});
