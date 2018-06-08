const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
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

  xdescribe('report', async () => {

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
      })
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
        executionid: executionid
      };

      const additional_parameters = {
        account: shipping_receipt.account,
        message: 'This is a message',
        state:'Some State!'
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'State.js'), class {
        constructor(){}
        create({entity}){
          expect(entity).to.have.property('name');
          expect(entity).to.have.property('account');
          expect(entity).to.have.property('entity');
          expect(entity).to.have.property('execution');
          expect(entity).to.have.property('message');
          expect(entity).to.have.property('state');
          return Promise.resolve(entity);
        }
      });

      const StepFunctionReporterController = global.SixCRM.routes.include('workers', 'statemachine/components/stepFunctionReporter.js');
      let stepFunctionReporterController = new StepFunctionReporterController();
      stepFunctionReporterController.state_name = 'Testing';
      stepFunctionReporterController.step_name = 'Start';

      let result = await stepFunctionReporterController.report(event, additional_parameters);
      expect(result.entity).to.equal(shipping_receipt.id);
      expect(result.account).to.equal(shipping_receipt.account);
      expect(result.name).to.equal('Testing');
      expect(result.execution).to.equal(executionid);
      expect(result.message).to.equal(additional_parameters.message);
      expect(result.state).to.equal(additional_parameters.state);

    });

  });

  describe('getAccount', async () => {

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


  /*
	}

	async getAccount(event){

		du.debug('Get Account');

		if(_.has(event, 'account')){
			return event.account;
		}

		if(_.has(event, 'guid') && _.has(this, 'entity_type')){

			let entity = await {
				rebill:this.getRebill(event),
				session:this.getSession(event),
				shipping_receipt:this.getShippingReceipt(event)
			}[this.entity_type];

			if(!_.isNull(entity) && _.has(entity, 'account')){
				return entity.account;
			}

		}

		return null;

	}
  */

});
