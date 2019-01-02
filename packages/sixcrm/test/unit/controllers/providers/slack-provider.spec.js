const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/slack-provider', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('sendMessageToWebhook', () => {

		it('successfully sends message to webhook', () => {

			let response = {statusCode: 200};

			let body = 'sample body';

			let message = 'test';

			let webhook = 'webhook test';

			mockery.registerMock('request', {
				post: (webhook, message, callback) => {
					callback(null, response, body);
				}
			});

			const SlackProvider = global.SixCRM.routes.include('controllers', 'providers/slack-provider.js');
			const slackprovider = new SlackProvider();

			return slackprovider.sendMessageToWebhook(message, webhook).then((result) => {
				expect(result).to.equal(body);
			});
		});

		it('returns error when message hasn\'t been sent to webhook', () => {

			let fail = 'fail';

			let message = 'test';

			let webhook = 'webhook test';

			mockery.registerMock('request', {
				post: (webhook, message, callback) => {
					callback(fail, null, null);
				}
			});

			const SlackProvider = global.SixCRM.routes.include('controllers', 'providers/slack-provider.js');
			const slackprovider = new SlackProvider();

			return slackprovider.sendMessageToWebhook(message, webhook).catch((error) => {
				expect(error).to.equal(fail);
			});
		});
	});
	describe('sendMessage', () => {

		it('successfully sends message when channel exists', () => {

			let response = {statusCode: 200};

			let body = 'sample body';

			let message = 'test';

			let channel = 'channel1';

			mockery.registerMock('request', {
				post: (webhook, message, callback) => {
					callback(null, response, body);
				}
			});

			const SlackProvider = global.SixCRM.routes.include('controllers', 'providers/slack-provider.js');
			const slackprovider = new SlackProvider();

			slackprovider.channels = {channel1: {path: 'test'}};

			return slackprovider.sendMessage(message, channel).then((result) => {
				expect(result).to.equal(body);
			});
		});

		it('returns validation error when channel doesn\'t exist', () => {

			let message = 'test';

			let channel = 'channel1';

			const SlackProvider = global.SixCRM.routes.include('controllers', 'providers/slack-provider.js');
			const slackprovider = new SlackProvider();

			slackprovider.channels = {channel2: {path: 'test'}};

			return slackprovider.sendMessage(message, channel).catch((error) => {
				expect(error.message).to.equal('[500] Undefined channel: ' + channel);
			});
		});

		it('returns error when message hasn\'t been sent', () => {

			let message = 'test';

			let channel = 'channel1';

			let fail = 'fail';

			mockery.registerMock('request', {
				post: (webhook, message, callback) => {
					callback(fail, null, null);
				}
			});

			const SlackProvider = global.SixCRM.routes.include('controllers', 'providers/slack-provider.js');
			const slackprovider = new SlackProvider();

			slackprovider.channels = {channel1: {path: 'test'}};

			return slackprovider.sendMessage(message, channel).catch((error) => {
				expect(error).to.equal(fail);
			});
		});
	});
});
