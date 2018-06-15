
//const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
//const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

describe('/helpers/notifications/Notification.js', () => {
	describe('constructor', () => {
		it('successfully constructs', () => {

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			expect(objectutilities.getClassName(notificationHelperClass)).to.equal('NotificationHelperClass');

		});
	});

	describe('isNotificationEventType', () => {

		it('returns true for valid notification types', () => {

			let event_type = 'test';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('eventtype', event_type);

			expect(notificationHelperClass.isNotificationEventType()).to.equal(true);

		});

		it('throws a 404 error when notification type is not recognized', () => {

			let event_type = 'unrecognized_event_type';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('eventtype', event_type);

			try {
				notificationHelperClass.isNotificationEventType();
			}catch(error){
				expect(error.message).to.equal("[404] Not a notification event type: " + event_type);
			}

		});

	});

	describe('instantiateNotificationClass', () => {

		it('successfully instantiates the default notification class', () => {

			let event_type = 'default';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('eventtype', event_type);

			return notificationHelperClass.instantiateNotificationClass().then(result => {
				expect(objectutilities.getClassName(notificationHelperClass.parameters.get('notificationclass'))).to.equal('DefaultNotification');
				expect(result).to.equal(true);
			});

		});

		it('successfully instantiates the test notification class', () => {

			let event_type = 'test';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('eventtype', event_type);

			return notificationHelperClass.instantiateNotificationClass().then(result => {

				expect(result).to.equal(true);
				expect(objectutilities.getClassName(notificationHelperClass.parameters.get('notificationclass'))).to.equal('TestNotification');

			});

		});

		it('successfully instantiates the test notification class using a regular expression', () => {

			let event_type = 'tes[t]+';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('eventtype', event_type);

			return notificationHelperClass.instantiateNotificationClass().then(result => {

				expect(result).to.equal(true);
				expect(objectutilities.getClassName(notificationHelperClass.parameters.get('notificationclass'))).to.equal('TestNotification');

			});

		});

		it('instantiates default notification class when there is no matching notification file for event type', () => {

			let event_type = 'unrecognized_event_type';
			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('eventtype', event_type);

			return notificationHelperClass.instantiateNotificationClass().then((result) => {

				expect(result).to.equal(true);
				expect(objectutilities.getClassName(notificationHelperClass.parameters.get('notificationclass'))).to.equal('DefaultNotification');

			});

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

			notificationHelperClass.parameters.set('context', context);
			notificationHelperClass.parameters.set('notificationclass', notificationclass);

			let result = notificationHelperClass.transformContext();

			expect(result).to.equal(true);
			expect(notificationHelperClass.parameters.store).to.have.property('transformedcontext');
			expect(notificationHelperClass.parameters.store['transformedcontext']).to.deep.equal(transformed_context);

		});

	});

	describe('executeNotificationActions', () => {

		it('successfully executes notification actions', () => {

			let transformed_context = {b: 1};

			let notificationclass = new class {
				constructor(){}
				triggerNotifications(){
					return Promise.resolve(true);
				}
			}

			const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
			let notificationHelperClass = new NotificationHelperClass();

			notificationHelperClass.parameters.set('transformedcontext', transformed_context);
			notificationHelperClass.parameters.set('notificationclass', notificationclass);

			return notificationHelperClass.executeNotificationActions().then(result => {
				expect(result).to.equal(true);
			});

		});

	});

});
