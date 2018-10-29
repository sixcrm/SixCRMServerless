const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage() {
	return MockEntities.getValidMessage()
}

describe('controllers/workers/components/worker.js', function () {

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

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			expect(objectutilities.getClassName(workerController)).to.equal('workerController');

		});

	});

	describe('setMessage', () => {

		it('returns unchanged message when message is specified', () => {

			let message = getValidMessage();

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			expect(workerController.setMessage(message)).to.equal(message);

		});

		it('retrieves message when message is not specified', () => {

			let message = getValidMessage();

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			workerController.parameters.set('message', message);

			expect(workerController.setMessage()).to.equal(message);
		});
	});

	describe('setResponseField', () => {

		it('returns response field unchanged when response field is specified', () => {

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			expect(workerController.setResponseField('a_response_field')).to.equal('a_response_field');
		});

		it('returns previously set response field when response field is not specified', () => {

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			workerController.response_field = 'a_response_field';

			expect(workerController.setResponseField()).to.equal('a_response_field');
		});

		it('returns default response field when response field is not specified nor previously set', () => {

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			delete workerController.response_field;

			expect(workerController.setResponseField()).to.equal('id');
		});
	});

	describe('pushEvent', () => {

		it('returns true under minimum conditions', () => {

			let context = {
				event_type: 'test'
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			return workerController.pushEvent({
				context: context
			});

		});

		it('returns true when event type is not specified but is present in the context', () => {

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			return workerController.pushEvent({
				event_type: 'test'
			});

		});

		it('throws an error when event_type is not set', () => {

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			try {

				return workerController.pushEvent({});

			} catch (error) {

				expect(error.message).to.equal('[500] Unable to identify event_type.');

			}

		});

		it('throws an error when context is not set', () => {

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			delete workerController.parameters.store;

			try {

				return workerController.pushEvent({
					event_type: 'test'
				});

			} catch (error) {

				expect(error.message).to.equal('[500] Unset context.');

			}

		});

		it('Sets default message attributes', () => {

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent({
					event_type,
					context,
					message_attributes
				}) {
					expect(event_type).to.equal('test');
					//expect(context).to.deep.equal({});
					//expect(message_attributes).to.deep.equal(expected_message_attributes);
					return Promise.resolve({});
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			return workerController.pushEvent({
				event_type: 'test'
			});

		});

		it('Sets explicit message attributes', () => {

			const message_attributes = {
				'event_type': {
					DataType: 'String',
					StringValue: 'test2'
				}
			};

			const expected_message_attributes = {
				'event_type': {
					DataType: 'String',
					StringValue: 'test2'
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent({
					event_type,
					message_attributes
				}) {
					expect(event_type).to.equal('test');
					expect(message_attributes).to.deep.equal(expected_message_attributes);
					return Promise.resolve({});
				}
			});

			const WorkerController = global.SixCRM.routes.include('workers', 'sqs/worker.js');
			let workerController = new WorkerController();

			return workerController.pushEvent({
				event_type: 'test',
				message_attributes: message_attributes
			});

		});

	});

});
