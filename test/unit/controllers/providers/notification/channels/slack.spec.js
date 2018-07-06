let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

describe('controllers/providers/notification/channels/slack.js', () => {

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
	});

	let valid_notification_object = {
		title: 'any',
		body: 'any'
	};

	describe('sendNotification', () => {

		it('should not send a message when the object is not valid', () => {

			let webhook = 'https://some.validwebhook.com/whatever';

			const SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/slack.js');
			let slack_notification_provider = new SlackNotificationProvider();

			return slack_notification_provider.sendNotification({}, webhook)
				.catch(error => {
					expect(error.message).has.string('[500] One or more validation errors occurred:');
				})


		});

		it('should attempt to send a message when the object is valid', () => {

			let webhook = 'http://test.com/webhook';

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					postJSON() {
						return Promise.resolve(true);
					}
				}
			});

			const SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/slack.js');
			let slack_notification_provider = new SlackNotificationProvider();

			return slack_notification_provider.sendNotification(valid_notification_object, webhook)
				.then(result => {
					expect(result).to.equal(true);
				});

		});

	});

	describe('validateNotificationProperties', () => {
		it('validates', () => {

			let notification_properties = 'https://some.slack.com/webhook?with=arguments#andanchors';

			const SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/slack.js');
			let slack_notification_provider = new SlackNotificationProvider();

			expect(slack_notification_provider.validateNotificationProperties(notification_properties)).to.equal(true);

		});
		it('fails to validate', () => {

			let invalid_notification_properties = [
				'some rando string',
				123,
				null,
				{},
				['abc123']
			];

			const SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/slack.js');
			let slack_notification_provider = new SlackNotificationProvider();

			arrayutilities.map(invalid_notification_properties, invalid => {
				try {
					let result = slack_notification_provider.validateNotificationProperties(invalid);
					expect(result).to.equal(false);
				}catch(error){
					expect(error.message).to.equal('[500] notification_properties must be a valid URL for Slack notifications');
				}

			});

		});

	});

});
