
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('/helpers/notifications/notificationtypes/components/BaseNotification.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('transformContext', () => {

		it('successfully transforms context', () => {

			let context = [{
				user: { id: 'some@user.com' },
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
			}];

			let BaseNotificationController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/BaseNotification.js');
			const baseNotificationController = new BaseNotificationController();

			baseNotificationController.name = 'test';

			expect(baseNotificationController.transformContext(context)).to.deep.equal({
				name: 'test',
				user: context[0].user.id,
				account: context[0].account,
				type: 'notification',
				category: 'base',
				context: {}
			});

		});
	});

	describe('createContext', () => {

		it('successfully creates context', () => {

			let context = [{
				user: { id: 'some@user.com' }
			}];

			let BaseNotificationController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/BaseNotification.js');
			const baseNotificationController = new BaseNotificationController();

			baseNotificationController.context_required = ['id'];

			expect(baseNotificationController.createContext(context)).to.deep.equal(context[0].user);

		});

		it('throws error when required context is not found', () => {

			let context = [{
				user: { id: 'some@user.com' }
			}];

			let BaseNotificationController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/BaseNotification.js');
			const baseNotificationController = new BaseNotificationController();

			baseNotificationController.context_required = ['name'];

			try {
				baseNotificationController.createContext(context)
			} catch (error) {
				expect(error.message).to.deep.equal("[500] Unable to identify \"name\" from context.");
			}
		});
	});

	describe('triggerNotifications', () => {

		it('triggers notifications for account', () => {

			let transformed_context = {};

			let BaseNotificationController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/BaseNotification.js');
			const baseNotificationController = new BaseNotificationController();

			const NotificationProvider = global.SixCRM.routes.include('providers', 'notification/Notification.js');
			baseNotificationController.notificationProvider = new NotificationProvider();

			baseNotificationController.account_wide = true;
			baseNotificationController.notificationProvider.createNotificationsForAccount = ({notification_prototype}) => {
				expect(notification_prototype).to.equal(transformed_context);
				return Promise.resolve(true);
			};

			expect(baseNotificationController.triggerNotifications(transformed_context)).to.deep.equal(transformed_context);

		});

		it('triggers notifications for account and user', () => {

			let transformed_context = {};

			let BaseNotificationController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/BaseNotification.js');
			const baseNotificationController = new BaseNotificationController();

			const NotificationProvider = global.SixCRM.routes.include('providers', 'notification/Notification.js');
			baseNotificationController.notificationProvider = new NotificationProvider();
			baseNotificationController.notificationProvider.createNotificationForAccountAndUser = ({notification_prototype}) => {
				expect(notification_prototype).to.equal(transformed_context);
				return Promise.resolve(true);
			};

			expect(baseNotificationController.triggerNotifications(transformed_context)).to.deep.equal(transformed_context);

		});
	});
});
