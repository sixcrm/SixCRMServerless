
const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const mockery = require('mockery');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

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

describe('controllers/workers/forwardmessage/shippedToDeliveredForwardMessage.js', () => {

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

			const ShippedToDeliveredForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/shippedToDeliveredForwardMessage.js');
			let shippedToDeliveredForwardMessageController = new ShippedToDeliveredForwardMessageController();

			return shippedToDeliveredForwardMessageController.execute().then(result => {
				du.info(result);
			});

		});

	});

});
