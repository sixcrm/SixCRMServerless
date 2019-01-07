

let chai = require('chai');
let expect = chai.expect;

const mockery = require('mockery');

describe('controllers/helpers/queue/Queue.js', () => {

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

	describe('listMessages', () => {

		it('returns empty array of messages when sqs utilities returns null', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve(null);
				}
			});

			const queueController = global.SixCRM.routes.include('controllers', 'helpers/queue/Queue.js');

			return queueController.listMessages('bill').then(messages => {
				expect(messages).to.deep.equal([]);
			});

		});

		it('returns empty array of messages when no messages in a queue', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve([]);
				}
			});

			const queueController = global.SixCRM.routes.include('controllers', 'helpers/queue/Queue.js');

			return queueController.listMessages('bill').then(messages => {
				expect(messages).to.deep.equal([]);
			});

		});

		it('parses and returns messages from a queue', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve([
						{MessageId: 1, Body: 'test message'},
						{MessageId: 2, Body: 'test message 2'}
					]);
				}
			});

			const queueController = global.SixCRM.routes.include('controllers', 'helpers/queue/Queue.js');

			return queueController.listMessages('bill').then(messages => {
				expect(messages).to.deep.equal([
					{id: 1, queue: 'bill', message: 'test message'},
					{id: 2, queue: 'bill', message: 'test message 2'}
				]);
			});

		});

		it('throws an error when queue rejects', (done) => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.reject('this is an error');
				}
			});

			const queueController = global.SixCRM.routes.include('controllers', 'helpers/queue/Queue.js');

			queueController.listMessages('bill')
				.catch(error => {
					expect(error).to.equal('this is an error');
					done();
				});

		});

	});

});
