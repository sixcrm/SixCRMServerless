
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

let rebill_id = null

process.argv.forEach((val) => {
	/* eslint-disable */
  if(stringutilities.isMatch(val, /^--rebill=[a-z0-9\-].*$/)){
    rebill_id = val.split('=')[1];
  }
/* eslint-enable */
});

describe('controllers/workers/forwardmessage/recoverToArchivedForwardMessage.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('execute', () => {

		it('leaves rebill in original state if filter is `noship` and product is shippable', () => {

			rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
			let message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					du.info('Message sent to queue (mock): '+queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: '+queue);
					return Promise.resolve(true);
				}
			});

			process.env.archivefilter = 'noship';

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				du.info(result);

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(timeSinceCreation).to.be.above(2);

				});
			});

		});

		it('leaves rebill in original state if filter is `twoattempts` but none of the products has `second_attempt`', () => {

			rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
			let message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					du.info('Message sent to queue (mock): '+queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: '+queue);
					return Promise.resolve(true);
				}
			});

			process.env.archivefilter = 'twoattempts';

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				du.info(result);

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(timeSinceCreation).to.be.above(2);

				});
			});

		});

		it('successfully updates rebill state and date when filter is `all`', () => {

			rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
			let message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					du.info('Message sent to queue (mock): '+queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: '+queue);
					return Promise.resolve(true);
				}
			});

			process.env.archivefilter = 'all';

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				du.info(result);

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(rebill.state).to.equal('archived');
					expect(rebill.previous_state).to.equal('recover');
					expect(timeSinceCreation).to.be.below(10);

				});
			});

		});

		it('properly handles errors from worker function', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

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

			process.env.archivefilter = 'all';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/archive.js'), {
				execute: () => {
					const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');
					const response = new WorkerResponse('error');

					return Promise.resolve(response);
				}
			});

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				expect(result.response.code).to.equal('success');

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(rebill.state).to.equal('recover_error');
					expect(rebill.previous_state).to.equal('recover');
					expect(timeSinceCreation).to.be.below(10);

				});
			})

		});

		it('properly handles failures from worker function', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

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

			process.env.archivefilter = 'all';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/archive.js'), {
				execute: () => {
					const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');
					const response = new WorkerResponse('fail');

					return Promise.resolve(response);
				}
			});

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				expect(result.response.code).to.equal('success');

				let rebillController = new RebillController();

				return rebillController.get({id: rebill_id}).then((rebill) => {
					du.info(rebill);

					const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

					expect(rebill.state).to.equal('recover_failed');
					expect(rebill.previous_state).to.equal('recover');
					expect(timeSinceCreation).to.be.below(10);

				});
			})

		});

		it('handles non-existant rebill', () => {

			rebill_id = uuidV4();
			let message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					du.info('Message sent to queue (mock): '+queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: '+queue);
					return Promise.resolve(true);
				}
			});

			process.env.archivefilter = 'noship';

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				du.info(result);

				expect(result.response.code).to.equal('error');
			});

		});

		it('handles incorrect rebill id', () => {

			rebill_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
			let message = getValidMessage(rebill_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue: queue}) {
					du.info('Message sent to queue (mock): '+queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: '+queue);
					return Promise.resolve(true);
				}
			});

			process.env.archivefilter = 'noship';

			const RecoverToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
			let recoverToArchiveController = new RecoverToArchiveController();

			return recoverToArchiveController.execute().then(result => {
				du.info(result);

				expect(result.response.code).to.equal('error');
			});

		});

	});

});
