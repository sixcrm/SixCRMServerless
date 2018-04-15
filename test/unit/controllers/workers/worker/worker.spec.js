const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

function getValidSession(id){

	return MockEntities.getValidSession(id);

}

function getValidRebill(id){

	return MockEntities.getValidRebill(id);

}

describe('controllers/workers/worker', function () {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	describe('acquireRebill', () => {

		afterEach(() => {
			mockery.resetCache();
		});

		after(() => {
			mockery.deregisterAll();
		});

		it('returns rebill', () => {

			let rebill = getValidRebill();
			let message = getValidMessage(rebill.id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				get({id}) {
					if(id == rebill.id){
						return Promise.resolve(rebill);
					}
					return Promise.resolve(null);
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
			let workerController = new WorkerController();

			workerController.parameters.set('parsedmessagebody', JSON.parse(message.Body));

			return workerController.acquireRebill().then(result => {
				expect(workerController.parameters.store['rebill']).to.deep.equal(rebill);
				expect(result).to.be.true;
			});

		});

	});

	describe('acquireSession', () => {

		afterEach(() => {
			mockery.resetCache();
		});

		after(() => {
			mockery.deregisterAll();
		});

		it('returns rebill', () => {

			let session = getValidSession();
			let message = getValidMessage(session.id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), class {
				get({id}) {
					if(id == session.id){
						return Promise.resolve(session);
					}
					return Promise.resolve(null);
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
			let workerController = new WorkerController();

			workerController.parameters.set('parsedmessagebody', JSON.parse(message.Body));

			return workerController.acquireSession().then(result => {
				expect(workerController.parameters.store['session']).to.deep.equal(session);
				expect(result).to.be.true;
			});

		});

	});

});
