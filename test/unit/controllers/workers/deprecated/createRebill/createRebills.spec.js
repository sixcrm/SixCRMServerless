
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidRebill(id){

	return MockEntities.getValidRebill(id);

}

function getValidSession(id){

	return MockEntities.getValidSession(id);

}

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

xdescribe('controllers/workers/getRebills', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.resetCache();
		mockery.deregisterAll();
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('instantiates the createRebillsController class', () => {

			const CreateRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
			let createRebillsController = new CreateRebillsController();

			expect(objectutilities.getClassName(createRebillsController)).to.equal('createRebillsController');

		});

	});

	describe('acquireSession', () => {

		it('successfully acquires a session', () => {

			let session = getValidSession();
			let message = getValidMessage();

			message.Body = JSON.stringify({id: session.id});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session)
				}
			});

			const CreateRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
			let createRebillsController = new CreateRebillsController();

			createRebillsController.parameters.set('message', message);

			return createRebillsController.acquireSession().then(result => {
				expect(result).to.equal(true);
				expect(createRebillsController.parameters.store['session']).to.deep.equal(session);
			});

		});

	});

	describe('createRebills', () => {

		it('successfully creates rebills', () => {

			let session = getValidSession();
			let rebill = getValidRebill();

			let mock_rebill_helper_controller = class {
				constructor(){

				}
				createRebill(){
					return Promise.resolve(rebill);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper_controller);

			const CreateRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
			let createRebillsController = new CreateRebillsController();

			createRebillsController.parameters.set('session', session);

			return createRebillsController.createRebills().then(result => {
				expect(result).to.equal(true);
				expect(createRebillsController.parameters.store['rebill']).to.deep.equal(rebill);
			});

		});

	});

	describe('respond', () => {

		it('successfully responds', () => {

			let rebill = getValidRebill();

			const CreateRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
			let createRebillsController = new CreateRebillsController();

			createRebillsController.parameters.set('rebill', rebill);

			let result = createRebillsController.respond();

			expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');

		});

	});

	describe('execute', () => {

		it('successfully executes', () => {

			let session = getValidSession();
			let message = getValidMessage();
			let rebill = getValidRebill();

			message.Body = JSON.stringify({id: session.id});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session)
				}
			});

			let mock_rebill_helper_controller = class {
				constructor(){

				}
				createRebill(){
					return Promise.resolve(rebill);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper_controller);

			const CreateRebillsController = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
			let createRebillsController = new CreateRebillsController();

			return createRebillsController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(createRebillsController.parameters.store['session']).to.deep.equal(session);
				expect(createRebillsController.parameters.store['rebill']).to.deep.equal(rebill);
			});

		});

	});

});
