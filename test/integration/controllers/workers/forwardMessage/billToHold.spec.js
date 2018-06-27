
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

describe('controllers/workers/forwardmessage/billToHold.js', () => {

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
			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
				du.info(result);

				return true;
			}).then(() => {

				return rebillController.get({id: rebill_id})

			}).then((rebill) => {

				expect(rebill.state).to.equal('hold');
				expect(rebill.previous_state).to.equal('bill');

				return rebillController.listTransactions(rebill)
					.then((transactions) => {
						return {rebill: rebill, transactions: transactions}
					});

			}).then(({rebill, transactions}) => {

				const allTransactions = transactions.transactions;

				const lastTransaction = allTransactions.sort((f, s) => {
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

			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
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

			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
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
					expect(queue).to.equal('bill_error');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('bill');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/processBilling.js'), {
				execute: () => {
					const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');

					const response = new WorkerResponse('error');

					return Promise.resolve(response);
				}
			});


			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
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
					expect(queue).to.equal('recover');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('bill');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/processBilling.js'), {
				execute: () => {
					const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');

					const response = new WorkerResponse('fail');

					return Promise.resolve(response);
				}
			});

			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
				expect(result.response.code).to.equal('success');
			})

		});

		it('does not execute register and moves message to error queue if rebill is not billable due to billed at date', () => {

			const rebill = MockEntities.getValidRebill();
			const session = MockEntities.getValidSession(rebill.parentsession);
			const schedules = [MockEntities.getValidProductSchedule(rebill.product_schedules[0])];

			const message = getValidMessage(rebill.id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					expect(queue).to.equal('bill_error');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('bill');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					rebill.bill_at = timestamp.toISO8601(timestamp.createTimestampSeconds() + timestamp.getDayInSeconds());
					return Promise.resolve(rebill);
				}
				getParentSession() {
					return Promise.resolve(session);
				}
				listProductSchedules() {
					return Promise.resolve(schedules);
				}
			});


			const rebill_helper_mock = class {
				constructor(){ }

				updateRebillState({rebill, new_state, previous_state}){
					expect(new_state).to.equal('bill_error');
					expect(previous_state).to.equal('bill');
					return Promise.resolve(rebill);
				}

			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), rebill_helper_mock);

			const process_mock = class {
				constructor(){ }

				process(){ expect.fail() }

			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), process_mock);

			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
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
					expect(queue).to.equal('recover');
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					expect(queue).to.equal('bill');
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

			const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
			const billToHoldForwardMessageController = new BillToHoldForwardMessageController();

			return billToHoldForwardMessageController.execute().then((result) => {
				expect(result.response.code).to.equal('success');

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(rebill.state).to.equal('recover');
					expect(rebill.previous_state).to.equal('bill');
					expect(timeSinceCreation).to.be.below(10);

				});
			})

		});


	});

});
