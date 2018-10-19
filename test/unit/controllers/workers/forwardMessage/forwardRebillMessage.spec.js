

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidRebill(){
	return MockEntities.getValidRebill();
}

function getValidMessage(id){
	return MockEntities.getValidMessage(id);
}

const getRebillResponseObject = (code) => {
	let rebill = getValidRebill();

	return {
		worker_response_object: {getCode: function() {return code}},
		message: getValidMessage(rebill.id)
	};
};

describe('workers/forwardRebillMessage', () => {

	describe('updateRebillState', () => {

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

		it('updates rebill after forwarding success message.', () => {

			let rebill = getValidRebill();

			const compound_worker_response_object = getRebillResponseObject('success');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			let mock_rebill_helper = class {
				constructor(){}

				updateRebillState({rebill, new_state, previous_state, error_message}) {
					expect(rebill).to.deep.equal(rebill);
					expect(previous_state).to.equal('some_origin_queue');
					expect(new_state).to.equal('some_destination_queue');
					expect(error_message).to.not.be.defined;

					return Promise.resolve(compound_worker_response_object);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

			const ForwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
			const forwardRebillMessageController = new ForwardRebillMessageController();

			forwardRebillMessageController.parameters.set('params', {
				name: 'some_queue_name',
				workerfunction: 'some_workerfunction',
				origin_queue: 'some_origin_queue',
				destination_queue: 'some_destination_queue',
				failure_queue: 'some_fail_queue',
				error_queue: 'some_error_queue'
			});

			return forwardRebillMessageController.updateRebillState(compound_worker_response_object).then((response) => {
				expect(response).to.deep.equal(compound_worker_response_object);
			})
		});

		it('updates rebill after forwarding failure message.', () => {

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			const compound_worker_response_object = getRebillResponseObject('fail');

			let mock_rebill_helper = class {
				constructor(){}

				updateRebillState({rebill, new_state, previous_state, error_message}) {
					expect(rebill).to.deep.equal(rebill);
					expect(new_state).to.equal('some_fail_queue');
					expect(previous_state).to.equal('some_origin_queue');
					expect(error_message).to.equal(undefined);

					return Promise.resolve(compound_worker_response_object);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

			const ForwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
			const forwardRebillMessageController = new ForwardRebillMessageController();

			forwardRebillMessageController.parameters.set('params', {
				name: 'some_queue_name',
				workerfunction: 'some_workerfunction',
				origin_queue: 'some_origin_queue',
				destination_queue: 'some_destination_queue',
				failure_queue: 'some_fail_queue',
				error_queue: 'some_error_queue'
			});

			return forwardRebillMessageController.updateRebillState(compound_worker_response_object).then((response) => {
				expect(response).to.deep.equal(compound_worker_response_object);
			})
		});

		it('updates rebill after forwarding error message.', () => {

			let rebill = getValidRebill();

			const compound_worker_response_object = getRebillResponseObject('error');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			let mock_rebill_helper = class {
				constructor(){}

				updateRebillState({rebill, new_state, previous_state, error_message}) {
					expect(rebill).to.deep.equal(rebill);
					expect(new_state).to.equal('some_error_queue');
					expect(previous_state).to.equal('some_origin_queue');
					expect(error_message).to.equal(undefined);

					return Promise.resolve(compound_worker_response_object);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

			const ForwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
			const forwardRebillMessageController = new ForwardRebillMessageController();

			forwardRebillMessageController.parameters.set('params', {
				name: 'some_queue_name',
				workerfunction: 'some_workerfunction',
				origin_queue: 'some_origin_queue',
				destination_queue: 'some_destination_queue',
				failure_queue: 'some_fail_queue',
				error_queue: 'some_error_queue'
			});

			return forwardRebillMessageController.updateRebillState(compound_worker_response_object).then((response) => {
				expect(response).to.deep.equal(compound_worker_response_object);
			})
		});

	});

});
