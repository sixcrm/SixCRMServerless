const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/workers/selectRebills.js', () => {

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
		it('successfully executes the constructor', () => {

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			expect(objectutilities.getClassName(selectRebillsController)).to.equal('SelectRebillsController');

		});
	});

	describe('getAvailableRebills', async () => {
		it('Gets available rebills', async () => {

			let ids = [
				'70de203e-f2fd-45d3-918b-460570338c9b',
				'55c103b4-670a-439e-98d4-5a2834bb5fc3',
				'c8b70738-755c-43c3-a953-1ef6fb4d1327',
				'f353819c-92b4-412e-ba71-349bb8c84958',
				'00c103b4-670a-439e-98d4-5a2834bb5f00'
			];

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve(ids);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.getAvailableRebills("2017-04-31T17:13:52.000Z");
			expect(result).to.deep.equal(ids);

		});

		it('returns an empty array', async () => {

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve([]);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.getAvailableRebills("2017-04-31T17:13:52.000Z");
			expect(result).to.deep.equal([]);

		});

	});

	describe('getAvailableRebillsOverPeriod', async () => {
		it('Gets available rebills', async () => {

			let ids = [
				'70de203e-f2fd-45d3-918b-460570338c9b',
				'55c103b4-670a-439e-98d4-5a2834bb5fc3',
				'c8b70738-755c-43c3-a953-1ef6fb4d1327',
				'f353819c-92b4-412e-ba71-349bb8c84958',
				'00c103b4-670a-439e-98d4-5a2834bb5f00'
			];

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve(ids);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.getAvailableRebillsOverPeriod();
			expect(result).to.deep.equal(ids);

		});

		it('Gets available rebills', async () => {

			let ids = [];

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve(ids);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.getAvailableRebillsOverPeriod();
			expect(result).to.deep.equal(ids);

		});
	});

	describe('pushToBilling', async () => {
		it('starts a billing state machine for the rebill', async () => {

			let rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event).to.have.property('stateMachineName');
					expect(event.guid).to.equal(rebill.id);
					expect(event.stateMachineName).to.equal('Billing');
					return Promise.resolve({
						executionArn: 'somearn'
					});
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.pushToBilling(rebill.id);
			expect(result).to.equal(true);

		});

		it('returns false (null response)', async () => {

			let rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event).to.have.property('stateMachineName');
					expect(event.guid).to.equal(rebill.id);
					expect(event.stateMachineName).to.equal('Billing');
					return Promise.resolve(null);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.pushToBilling(rebill.id);
			expect(result).to.equal(false);

		});

		it('throws an error (null response)', async () => {

			let rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event).to.have.property('stateMachineName');
					expect(event.guid).to.equal(rebill.id);
					expect(event.stateMachineName).to.equal('Billing');
					throw new Error('howdy!');
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.pushToBilling(rebill.id);
			expect(result).to.equal(false);

		});

	});

	describe('markRebillAsProcessing', async () => {
		it('updates a rebill with processing: true', async () => {

			let a_rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('helpers','entities/rebill/Rebill.js'), class{
				constructor(){}
				updateRebillProcessing({rebill, processing}){
					expect(rebill).to.deep.equal(a_rebill);
					expect(processing).to.equal(true);
					a_rebill.processing = true;
					return Promise.resolve(a_rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.equal(a_rebill.id);
					return Promise.resolve(a_rebill);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.markRebillAsProcessing(a_rebill.id);
			expect(result).to.equal(true);

		});

		it('returns false', async () => {

			let a_rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('helpers','entities/rebill/Rebill.js'), class{
				constructor(){}
				updateRebillProcessing({rebill, processing}){
					expect(rebill).to.deep.equal(a_rebill);
					expect(processing).to.equal(true);
					throw new Error('howdy!')
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.equal(a_rebill.id);
					return Promise.resolve(null);
				}
			});


			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.markRebillAsProcessing(a_rebill.id, false);
			expect(result).to.equal(false);

		});

		it('throws an error', async () => {

			let a_rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('helpers','entities/rebill/Rebill.js'), class{
				constructor(){}
				updateRebillProcessing({rebill, processing}){
					expect(rebill).to.deep.equal(a_rebill);
					expect(processing).to.equal(true);
					throw new Error('howdy!')
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.equal(a_rebill.id);
					return Promise.resolve(null);
				}
			});


			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			try{
				await selectRebillsController.markRebillAsProcessing(a_rebill.id);
				expect(false).to.equal(true, 'Method should not have executed.');
			}catch(error){
				expect(error.message).to.equal('[500] Unable to acquire rebill.');
			}

		});
	});

	describe('pushRebillIntoStateMachine', async () => {
		it('returns true', async () => {

			let a_rebill = MockEntities.getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event).to.have.property('stateMachineName');
					expect(event.guid).to.equal(a_rebill.id);
					expect(event.stateMachineName).to.equal('Billing');
					return Promise.resolve({
						executionArn: 'somearn'
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers','entities/rebill/Rebill.js'), class{
				constructor(){}
				updateRebillProcessing({rebill, processing}){
					expect(rebill).to.deep.equal(a_rebill);
					expect(processing).to.equal(true);
					a_rebill.processing = true;
					return Promise.resolve(a_rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.equal(a_rebill.id);
					return Promise.resolve(a_rebill);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result =  await selectRebillsController.pushRebillIntoStateMachine(a_rebill.id);
			expect(result).to.equal(true);

		});

	});

	describe('transformResponse', async () => {
		it('returns true', async () => {

			let responses = [true, true, true];

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result =  await selectRebillsController.transformResponse(responses);
			expect(result).to.equal(true);

		});

		it('throws an error (has a false)', async () => {

			let responses = [true, false, true];

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			try{
				let result =  await selectRebillsController.transformResponse(responses);
				expect(true).to.equal(false, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.have.string('Results array contained one or more failures:');
			}

		});

		it('throws an error (non-array)', async () => {

			let responses = 'abc';

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			try{
				let result =  await selectRebillsController.transformResponse(responses);
				expect(true).to.equal(false, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.have.string('Non-array results argument');
			}

		});

		it('returns false', async () => {

			let responses = [true, true, false];

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result =  await selectRebillsController.transformResponse(responses, false);
			expect(result).to.equal(false);

		});
	});

	describe('execute', async () => {
		it('returns "SUCCESS"', async () => {

			let rebills = MockEntities.getValidRebills();
			let ids = arrayutilities.map(rebills, rebill => rebill.id);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve(ids);
				}
				updateRebillProcessing({rebill, processing}){
					expect(rebill).to.be.a('object');
					expect(processing).to.equal(true);
					rebill.processing = true;
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event.guid).to.be.a('string');
					expect(event).to.have.property('stateMachineName');
					expect(event.stateMachineName).to.equal('Billing');
					return Promise.resolve({
						executionArn: 'somearn'
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(arrayutilities.find(rebills, rebill => { return rebill.id == id }));
				}
			});


			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.execute();
			expect(result).to.equal('SUCCESS');

		});

		it('returns "FAILURE"', async () => {

			let rebills = MockEntities.getValidRebills();
			let ids = arrayutilities.map(rebills, rebill => rebill.id);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve(ids);
				}
				updateRebillProcessing({rebill, processing}){
					expect(false).to.equal(true, 'Method should not have executed.');
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event.guid).to.be.a('string');
					expect(event).to.have.property('stateMachineName');
					expect(event.stateMachineName).to.equal('Billing');
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(arrayutilities.find(rebills, rebill => { return rebill.id == id }));
				}
			});


			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			try{
				await selectRebillsController.execute();
				expect(false).to.equal(true);
			}catch(error){
				expect(error.message).to.have.string('Results array contained one or more failures:');
			}

		});

		it('returns "NOREBILLS"', async () => {

			let rebills = [];

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve([]);
				}
			});

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.execute();
			expect(result).to.equal('NOREBILLS');

		});
	});

	xdescribe('execute (LIVE)', async () => {
		it('returns "SUCCESS"', async () => {

			/*
			let rebills = MockEntities.getValidRebills();
			let ids = arrayutilities.map(rebills, rebill => rebill.id);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class{
				constructor(){}
				getAvailableRebills(now){
					expect(now).to.be.a('string');
					return Promise.resolve(ids);
				}
				updateRebillProcessing({rebill, processing}){
					expect(rebill).to.be.a('object');
					expect(processing).to.equal(true);
					rebill.processing = true;
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('workers','statemachine/components/stepFunctionTrigger.js'), class{
				constructor(){}
				execute(event){
					expect(event).to.have.property('guid');
					expect(event.guid).to.be.a('string');
					expect(event).to.have.property('stateMachineName');
					expect(event.stateMachineName).to.equal('Billing');
					return Promise.resolve({
						executionArn: 'somearn'
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities','Rebill.js'), class{
				constructor(){}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(arrayutilities.find(rebills, rebill => { return rebill.id == id }));
				}
			});
			*/

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			let result = await selectRebillsController.execute();
			expect(result).to.equal('SUCCESS');

		});

	});

});
