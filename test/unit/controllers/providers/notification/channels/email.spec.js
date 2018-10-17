const _ = require('lodash');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/notification/channels/email.js', () => {

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

	describe('sendNotification', () => {

		it('should not send a message when the object is not valid', () => {

			let notification_object = {};
			let notification_properties = 'user@test.com';

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				sendEmail() {
					return Promise.resolve(true);
				}
			});

			const EmailNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/email.js');
			let email_notification_provider =  new EmailNotificationProvider();

			return email_notification_provider.sendNotification(notification_object, notification_properties)
				.catch((error) => {
					expect(error.message).to.have.string('[500] One or more validation errors occurred:');
				});

		});

		it('should attempt to send a message when the object is valid', () => {

			let notification_object = {
				title:"This is a title",
				body: "This is a body"
			};

			let notification_properties = 'user@test.com';

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				sendEmail(email) {
					expect(email).to.have.property('recepient_emails');
					expect(email).to.have.property('subject');
					expect(email).to.have.property('body');
					expect(_.isArray(email.recepient_emails)).to.equal(true);
					expect(email.recepient_emails[0]).to.equal(notification_properties);
					return Promise.resolve(true);
				}
			});

			const EmailNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/email.js');
			let email_notification_provider =  new EmailNotificationProvider();

			return email_notification_provider.sendNotification(notification_object, notification_properties)
				.then(result => {
					expect(result).to.equal(true);
				})

		});

		it('should attempt to send a message when the object is valid', () => {

			let notification_object = {
				title:"This is a title",
				body: "This is a body"
			};

			let notification_properties = {
				email: 'user@test.com',
				name: 'Some User'
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				sendEmail(email) {

					expect(email).to.have.property('recepient_emails');
					expect(email).to.have.property('subject');
					expect(email).to.have.property('body');
					expect(_.isArray(email.recepient_emails)).to.equal(true);
					expect(email.recepient_emails[0]).to.equal(notification_properties.email);
					expect(email).to.have.property('recepient_name');
					expect(email.recepient_name).to.equal(notification_properties.name);

					return Promise.resolve(true);
				}
			});

			const EmailNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/channels/email.js');
			let email_notification_provider =  new EmailNotificationProvider();

			return email_notification_provider.sendNotification(notification_object, notification_properties)
				.then(result => {
					expect(result).to.equal(true);
				});

		});

	});

});
