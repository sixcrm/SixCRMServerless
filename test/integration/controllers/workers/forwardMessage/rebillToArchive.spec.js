
const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

let session_id = null

process.argv.forEach((val) => {
	/* eslint-disable */
  if(stringutilities.isMatch(val, /^--session=[a-z0-9\-].*$/)){
    session_id = val.split('=')[1];
  }
  /* eslint-enable */
});

describe('controllers/workers/forwardmessage/rebillToDeliveredForwardMessage.js', () => {

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

		it('successfully executes', () => {

			session_id = (!_.isNull(session_id))?session_id:uuidV4();
			let message = getValidMessage(session_id);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					du.info('Message read from queue (mock): '+queue);
					return Promise.resolve([message]);
				}
				sendMessage({queue}) {
					du.info('Message sent to queue (mock): '+queue);
					return Promise.resolve(true);
				}
				deleteMessage({queue}) {
					du.info('Deleting message from queue: '+queue);
					return Promise.resolve(true);
				}
			});

			const RebillToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/rebillToArchivedForwardMessage.js');
			let rebillToArchivedForwardMessageController = new RebillToArchivedForwardMessageController();

			return rebillToArchivedForwardMessageController.execute().then(result => {
				du.info(result);
			});

		});

	});

});
