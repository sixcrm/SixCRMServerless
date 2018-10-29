let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/notification/channels/sms.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('sendNotification', () => {

		it('should not send a message when the object is not valid', () => {

			let notification_object = {};
			let notification_properties = '+381630000000';

			const SMSNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/sms.js');
			let sms_notification_provider =  new SMSNotificationProvider();

			return sms_notification_provider.sendNotification(notification_object, notification_properties)
				.catch((error) => {
					return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
				});

		});

		it('should attempt to send a message when the object is valid', () => {

			let notification_object = {
				title:'A title!',
				body:'A body!'
			};

			let notification_properties = '+381630000000';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				sendSMS() {
					return Promise.resolve(true);
				}
			});

			const SMSNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/sms.js');
			let sms_notification_provider =  new SMSNotificationProvider();

			return sms_notification_provider.sendNotification(notification_object, notification_properties)
				.then((result) => {
					expect(result).to.equal(true);
				});

		});

	});

	describe('getInternationalPhoneNumber', () => {

		it('returns international phone number', () => {

			let notification_properties = '+381630000000';

			const SMSNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/sms.js');
			let sms_notification_provider =  new SMSNotificationProvider();

			expect(sms_notification_provider.getInternationalPhoneNumber(notification_properties)).to.equal(notification_properties);

		});

		it('appends "+1" to international phone number', () => {

			let notification_properties = '0630000000';

			const SMSNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/sms.js');
			let sms_notification_provider =  new SMSNotificationProvider();

			expect(sms_notification_provider.getInternationalPhoneNumber(notification_properties)).to.equal('+1'+notification_properties);

		});

	});

	describe('formatSmsBody', () => {

		it('returns abbreviated SMS body if it\'s longer than limit', () => {

			let notification_object = {
				title:'A title!',
				body:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mauris elit, varius quis vestibulum nec, pretium in felis. In eget mollis tellus.',
			};

			const SMSNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/sms.js');
			let sms_notification_provider =  new SMSNotificationProvider();

			expect(sms_notification_provider.formatSMSBody(notification_object)).to.equal(notification_object.body.substr(0, 137)+'...');

		});

	});
});
