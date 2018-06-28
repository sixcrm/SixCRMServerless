const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const hashutilities = require('@6crm/sixcrmcore/util/hash-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/components/stepFunctionReporter.js', () => {

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

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      expect(objectutilities.getClassName(stepFunctionReporterController)).to.equal('StepFunctionReporterController');

    });

  });

  describe('consolidateEvent', () => {
    it('successfully consolidates the event', () => {

      let event = {
        guid: "564c59b0-978c-4f39-accd-906edf13bd21",
        stateMachineName: "Billing",
        executionid: "4a86b6c8c0c1b2f4b721a6f99a4595853142c16f",
        status: "NOSHIP",
        reporting: {
          state: "Prefulfillment",
          step: "No Fulfillment Required",
          message: "No Fulfillment Required."
        }
      };

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      stepFunctionReporterController.consolidateEvent(event);
      expect(event).to.have.property('state');
      expect(event).to.have.property('step');
      expect(event).to.have.property('message');

    })
  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let rebill = MockEntities.getValidRebill();
      rebill.id = "564c59b0-978c-4f39-accd-906edf13bd21";

      let event = {
        guid: "564c59b0-978c-4f39-accd-906edf13bd21",
        stateMachineName: "Prefulfillment",
        executionid: "d2751be3710675acb1137fa8814ce0df46d12414",
        status: "NOSHIP",
        reporting: {
          state: "Prefulfillment",
          step: "No Fulfillment Required",
          message: "No Fulfillment Required."
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'State.js'), class {
        constructor(){}
        create({entity}){
          expect(entity).to.be.a('object');
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = await stepFunctionReporterController.execute(event);
      expect(result).to.equal('SUCCESS');

    });

  });

  describe('getExecution', async () => {
    it('successfully aquires the execution', async () => {

      let event = {
        executionid: 'someexecutionid'
      };

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = stepFunctionReporterController.getExecution(event);
      expect(result).to.equal('someexecutionid');

    });

    it('returns null', async () => {

      let event = {};

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = stepFunctionReporterController.getExecution(event);
      expect(result).to.equal(null);

    });
  });

  describe('getName', async () => {
    it('successfully aquires the name', async () => {

      const event = {state: 'somestate'};

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = stepFunctionReporterController.getName(event);
      expect(result).to.equal('somestate');

    });

    it('successfully aquires the name from the class', async () => {

      const event = {};
      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();
      stepFunctionReporterController.state_name = 'somestate';

      let result = stepFunctionReporterController.getName(event);
      expect(result).to.equal('somestate');

    });

    it('successfully aquires the name from the class', async () => {

      const event = {
        stateMachineName: 'somestate'
      };

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();
      stepFunctionReporterController.state_name = 'somestate';

      let result = stepFunctionReporterController.getName(event);
      expect(result).to.equal('somestate');

    });

  });

  describe('getEntity', () => {

    it('successfully aquires the guid', () => {

      const rebill = MockEntities.getValidRebill();

      const event = {
        guid: rebill.id
      };

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = stepFunctionReporterController.getEntity(event);
      expect(result).to.equal(rebill.id);

    });

    it('returns null', () => {

      const event = {};

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = stepFunctionReporterController.getEntity(event);
      expect(result).to.equal(null);

    });

  });

  describe('report', async () => {

    it('successfully reports', async () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();

      let executionid = hashutilities.toSHA1('arandomstring');

      const event = {
        guid: shipping_receipt.id,
        executionid: executionid,
        account: shipping_receipt.account
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'State.js'), class {
        constructor(){}
        create({entity}){
          expect(entity).to.have.property('name');
          expect(entity).to.have.property('account');
          expect(entity).to.have.property('entity');
          expect(entity).to.have.property('execution');
          return Promise.resolve(entity);
        }
      });

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();
      stepFunctionReporterController.state_name = 'Testing';
      stepFunctionReporterController.step_name = 'Start';

      let result = await stepFunctionReporterController.report(event);
      expect(result.entity).to.equal(shipping_receipt.id);
      expect(result.account).to.equal(shipping_receipt.account);
      expect(result.name).to.equal('Testing');
      expect(result.execution).to.equal(executionid);

    });

    it('successfully reports with additional parameters', async () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();

      let executionid = hashutilities.toSHA1('arandomstring');

      const event = {
        guid: shipping_receipt.id,
        account: shipping_receipt.account,
        state:'Somestate',
        message: 'somemessage',
  			step: 'somestep',
  			executionid: executionid
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'State.js'), class {
        constructor(){}
        create({entity}){
          expect(entity).to.have.property('name');
          expect(entity).to.have.property('account');
          expect(entity).to.have.property('entity');
          expect(entity).to.have.property('execution');
          expect(entity).to.have.property('message');
          expect(entity).to.have.property('step');
          return Promise.resolve(entity);
        }
      });

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();

      let result = await stepFunctionReporterController.report(event);
      expect(result.entity).to.equal(shipping_receipt.id);
      expect(result.account).to.equal(shipping_receipt.account);
      expect(result.name).to.equal('Somestate');
      expect(result.execution).to.equal(executionid);
      expect(result.message).to.equal('somemessage');
      expect(result.name).to.equal('Somestate');

    });

  });

});
