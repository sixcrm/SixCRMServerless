
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

let rebill_id = null;

process.argv.forEach((val) => {
	/* eslint-disable */
  if(stringutilities.isMatch(val, /^--rebill=[a-z0-9\-].*$/)){
    rebill_id = val.split('=')[1];
  }
  /* eslint-enable */
});

describe('controllers/workers/forwardmessage/recoverToHoldForwardMessage.js', () => {

	describe('execute', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {
			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('successfully executes', () => {

			rebill_id = (!_.isNull(rebill_id)) ? rebill_id : uuidV4();
			const message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): ' + queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					du.info('Message sent to queue (mock): ' + queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: ' + queue);
					return Promise.resolve(true);
				}
			});

			const rebillController = new RebillController();
			const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
			const recoverToHoldForwardMessageController = new RecoverToHoldForwardMessageController();

			return recoverToHoldForwardMessageController.execute().then((result) => {
				du.info(result);

				return true;
			}).then(() => {

				return rebillController.get({id: rebill_id})

			}).then((rebill) => {

				expect(rebill.state).to.equal('hold');
				expect(rebill.previous_state).to.equal('recover');

				return rebillController.listTransactions(rebill)
					.then((transactions) => {
						return {rebill: rebill, transactions: transactions}
					});

			}).then(({rebill, transactions}) => {

				const allTransactions = transactions.transactions;

				let lastTransaction = allTransactions.sort((f, s) => {
					if (f.created_at < s.created_at) return 1;

					if (f.created_at > s.created_at) return -1;

					return 0;
				})[0];

				const timeSinceCreation = timestamp.getSecondsDifference(lastTransaction.created_at);

				expect(timeSinceCreation).to.be.below(10);
				expect(lastTransaction.rebill).to.equal(rebill_id);
				expect(lastTransaction.amount).to.equal(rebill.amount);
				expect(lastTransaction.products.length).to.equal(rebill.products.length);

			})
		});

		it('successfuly executes if no messages in queue found', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): ' + queue);
					return Promise.resolve([]);
				}
			});

			const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
			const recoverToHoldForwardMessageController = new RecoverToHoldForwardMessageController();

			return recoverToHoldForwardMessageController.execute().then((result) => {
				du.info(result);

				return true;
			})
		});

		it('fails with error response if non existing rebill is retrieved from sqs', () => {

			const message = getValidMessage();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
			});

			const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
			const recoverToHoldForwardMessageController = new RecoverToHoldForwardMessageController();

			return recoverToHoldForwardMessageController.execute().then((result) => {
				expect(result.response.code).to.equal('error');
			})

		});

		it('properly handles error if happens in worker function', () => {

			rebill_id = (!_.isNull(rebill_id)) ? rebill_id : uuidV4();
			const message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					expect(queue).to.equal('recover_error');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('recover');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/recoverBilling.js'), {
				execute: () => {
					const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');

					const response = new WorkerResponse('error');

					return Promise.resolve(response);
				}
			});

			const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
			const recoverToHoldForwardMessageController = new RecoverToHoldForwardMessageController();

			return recoverToHoldForwardMessageController.execute().then((result) => {
				expect(result.response.code).to.equal('success');
			})

		});

		it('properly handles failure if happens in worker function', () => {

			rebill_id = (!_.isNull(rebill_id)) ? rebill_id : uuidV4();
			const message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					expect(queue).to.equal('recover_failed');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('recover');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/recoverBilling.js'), {
				execute: () => {
					const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');

					const response = new WorkerResponse('fail');

					return Promise.resolve(response);
				}
			});

			const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
			const recoverToHoldForwardMessageController = new RecoverToHoldForwardMessageController();

			return recoverToHoldForwardMessageController.execute().then((result) => {
				expect(result.response.code).to.equal('success');
			})

		});

		it('properly updates rebill if failure happens in worker function', () => {

			rebill_id = (!_.isNull(rebill_id)) ? rebill_id : uuidV4();
			const message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					expect(queue).to.equal('recover_failed');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('recover');
					return Promise.resolve(true);
				}
			});

			const register_mock = class {
				constructor(){ }

				processTransaction() {
					return Promise.resolve({
						getCode: () => 'fail'
					})
				}

			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), register_mock);

			const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
			const recoverToHoldForwardMessageController = new RecoverToHoldForwardMessageController();

			return recoverToHoldForwardMessageController.execute().then((result) => {
				expect(result.response.code).to.equal('success');

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(rebill.state).to.equal('recover_failed');
					expect(rebill.previous_state).to.equal('recover');
					expect(rebill.second_attempt).to.equal('true');
					expect(timeSinceCreation).to.be.below(10);

				});
			})

		});
	});

});
