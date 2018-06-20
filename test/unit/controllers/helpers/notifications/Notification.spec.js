const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

describe('/helpers/notifications/Notification.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.resetCache();
		mockery.deregisterAll();
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			expect(objectutilities.getClassName(notificationHelperClass)).to.equal('NotificationHelperClass');

		});

	});

	describe('executeNotifications', async () => {

		it('returns true', async () => {

			let context = {a:'1', user: 'some.user@sixcrm.com'};
			let transformed_context = {b: 1};

			let argumentation = {
				event_type: 'test',
				context: context
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'notifications/notificationtypes/test.js'), class {
				constructor(){}
				transformContext(a_context){
					expect(a_context).to.be.a('object');
					expect(a_context).to.deep.equal(context);
					return transformed_context;
				}
				triggerNotifications(a_transformed_context){
					expect(a_transformed_context).to.deep.equal(transformed_context);
					return true;
				}
			});

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = await notificationHelperClass.executeNotifications(argumentation);
			expect(result).to.equal(true);

		});

	});

	describe('isNotificationEventType', () => {

		it('returns true for valid notification types', () => {

			let event_type = 'test';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			expect(notificationHelperClass.isNotificationEventType(event_type)).to.equal(true);

		});

		it('returns false for invalid notification types', () => {

			let event_type = 'unrecognized_event_type';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			expect(notificationHelperClass.isNotificationEventType(event_type)).to.equal(false);

		});

	});

	describe('validateNotification', () => {

		it('returns an error when event_type is null', () => {

			let event_type = null;
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			try{
				notificationHelperClass.validateNotification(event_type, {});
				expect(false).to.equal(true, 'Method should not have executed.');
			}catch(error){
				expect(error.message).to.equal('[500] Expected "event_type" property to be set.')
			}

		});

		it('returns an error when event_type is undefined', () => {

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			try{
				notificationHelperClass.validateNotification(undefined, {});
				expect(false).to.equal(true, 'Method should not have executed.');
			}catch(error){
				expect(error.message).to.equal('[500] Expected "event_type" property to be set.')
			}

		});

		it('returns an error when context is null', () => {

			let event_type = 'someeventtype';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			try{
				notificationHelperClass.validateNotification(event_type, null);
				expect(false).to.equal(true, 'Method should not have executed.');
			}catch(error){
				expect(error.message).to.equal('[500] Expected "context" property to be set.')
			}

		});

		it('returns an error when context is undefined', () => {

			let event_type = 'someeventtype';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			try{
				notificationHelperClass.validateNotification(event_type, undefined);
				expect(false).to.equal(true, 'Method should not have executed.');
			}catch(error){
				expect(error.message).to.equal('[500] Expected "context" property to be set.')
			}

		});

	});

	describe('instantiateNotificationClass', async () => {

		it('returns a notification class', async () => {

			let event_type = 'default';

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = await notificationHelperClass.instantiateNotificationClass(event_type);

			expect(objectutilities.getClassName(result)).to.equal('DefaultNotification');

		});

		it('successfully instantiates the test notification class', async () => {

			let event_type = 'test';

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = await notificationHelperClass.instantiateNotificationClass(event_type);

			expect(objectutilities.getClassName(result)).to.equal('TestNotification');

		});

		it('successfully instantiates the test notification class using a regular expression', async () => {

			let event_type = 'tes[t]+';

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = await notificationHelperClass.instantiateNotificationClass(event_type);

			expect(objectutilities.getClassName(result)).to.equal('TestNotification');

		});

		it('instantiates default notification class when there is no matching notification file for event type', async () => {

			let event_type = 'unrecognized_event_type';

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = await notificationHelperClass.instantiateNotificationClass(event_type);

			expect(objectutilities.getClassName(result)).to.equal('DefaultNotification');

		});

	});

	describe('transformContext', () => {

		it('successfully transforms the context object', () => {

			let context = {a:'1'};
			let transformed_context = {b: 1};

			let notificationclass = new class {
				constructor(){}
				transformContext(){
					return transformed_context;
				}
			}

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = notificationHelperClass.transformContext(notificationclass, context);
			expect(result).to.deep.equal(transformed_context);

		});

	});

	describe('executeNotificationActions', async () => {

		it('successfully executes notification actions', async () => {

			let transformed_context = {b: 1};

			let notificationclass = new class {
				constructor(){}
				triggerNotifications(){
					return Promise.resolve(true);
				}
			}

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			let result = await notificationHelperClass.executeNotificationActions(notificationclass, transformed_context);
			expect(result).to.equal(true);

		});

	});

});
