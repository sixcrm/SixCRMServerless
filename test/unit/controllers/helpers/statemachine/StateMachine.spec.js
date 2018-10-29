const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const hashutilities = require('@6crm/sixcrmcore/util/hash-utilities').default;
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

	after(() => {
		mockery.disable();
	});

  describe('constructor', () => {

    it('successfully constructs', () => {

      const StateMachineHelperController = global.SixCRM.routes.include('helpers', 'statemachine/StateMachine.js');
      let stateMachineHelperController = new StateMachineHelperController();

      expect(objectutilities.getClassName(stateMachineHelperController)).to.equal('StateMachineHelperController');

    });

  });

  describe('getRunningExecutions', async () => {

    it('gets running executions', async () => {

      const state_name = 'Closesession';
      const state = {
        id: '668ad918-0d09-4116-a6fe-0e8a9eda36f7'
      };

      let mock_state = MockEntities.getValidState({entity: state.id, state_name: state_name})
      mock_state.execution = '8f1e08df2def1752820662e49cd988f45dc9dc1a';
      let states = [mock_state];

      mockery.registerMock(global.SixCRM.routes.path('entities', 'State.js'), class {
        constructor(){}
        listByEntityAndState({entity, state}){
          expect(entity).to.be.a('string');
          expect(state).to.be.a('string');
          return Promise.resolve({states: states});
        }
      });

      const account = global.SixCRM.configuration.site_config.aws.account;
      const region = global.SixCRM.configuration.site_config.aws.region;

      let provider_response = {
        executionArn: 'arn:aws:states:'+region+':'+account+':execution:'+state_name+':'+mock_state.execution,
        stateMachineArn: 'arn:aws:states:'+region+':'+account+':stateMachine:'+state_name,
        name: mock_state.execution,
        status: 'RUNNING',
        startDate: '2018-06-10T16:36:16.822Z',
        input: '{"stateMachineName":"'+state_name+'","guid":"'+state.id+'","executionid":"'+mock_state.execution+'"}'
      };

      mockery.registerMock(global.SixCRM.routes.path('providers', 'stepfunction-provider.js'), class {
        constructor(){}
        describeExecution(parameters){
          expect(parameters).to.have.property('executionArn');
          expect(parameters.executionArn).to.have.string(mock_state.execution);
          return Promise.resolve(provider_response);
        }
      });

      const StateMachineHelperController = global.SixCRM.routes.include('helpers', 'statemachine/StateMachine.js');
      let stateMachineHelperController = new StateMachineHelperController();

      let result = await stateMachineHelperController.getRunningExecutions({id: state.id, state: state_name});
      expect(result).to.be.a('array');
      expect(result[0]).to.have.property('entity');
      expect(result[0]).to.have.property('name');
      expect(result[0].entity).to.equal(state.id);
      expect(result[0].name).to.equal(state_name);

    });

  });

  /*
  async getRunningExecutions({id, state}){

		du.debug('Get Running Executions');

		let running_executions = await this.getExecutions({id: id, state: state, status: 'RUNNING'});

		if(_.isArray(running_executions) && arrayutilities.nonEmpty(running_executions)){
			return running_executions;
		}

		return null;

	}
  */

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
