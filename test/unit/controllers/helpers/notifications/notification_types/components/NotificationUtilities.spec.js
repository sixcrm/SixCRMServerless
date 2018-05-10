
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('/helpers/notifications/notificationtypes/components/NotificationUtilities.js', () => {
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

	describe('getName', () => {

		it('successfully gets notification name', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			notificationUtilitiesController.name = 'test';

			expect(notificationUtilitiesController.getName()).to.equal('test');

		});

		it('successfully gets notification name', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			notificationUtilitiesController.name = 'lead';

			expect(notificationUtilitiesController.getName()).to.equal('lead');

		});

		it('throws error when notification name is not successfully retrieved', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			try{
				notificationUtilitiesController.getName();
			} catch (error) {
				expect(error.message).to.equal('[500] Nameless notification, very cryptic.');
			}
		});
	});

	describe('getNotificationCategory', () => {

		it('successfully gets notification category', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			notificationUtilitiesController.category = 'test';

			expect(notificationUtilitiesController.getNotificationCategory()).to.equal('test');

		});

		it('successfully gets notification category', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			notificationUtilitiesController.category = 'transaction';

			expect(notificationUtilitiesController.getNotificationCategory()).to.equal('transaction');

		});

		it('throws error when notification category is not successfully retrieved', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			try{
				notificationUtilitiesController.getNotificationCategory();
			} catch (error) {
				expect(error.message).to.equal('[500] Unable to determine notification category.');
			}
		});
	});

	describe('getNotificationType', () => {

		it('successfully gets notification type', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			notificationUtilitiesController.notification_type = 'notification';

			expect(notificationUtilitiesController.getNotificationType()).to.equal('notification');

		});

		it('throws error when notification type is not successfully retrieved', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			try{
				notificationUtilitiesController.getNotificationType();
			} catch (error) {
				expect(error.message).to.equal('[500] Unable to determine notification type.');
			}
		});

		it('throws error when notification type is not recognized', () => {

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			notificationUtilitiesController.notification_type = 'unrecognized_type';

			try{
				notificationUtilitiesController.getNotificationType();
			} catch (error) {
				expect(error.message).to.equal('[500] One or more validation errors occurred: [Notification Type] instance should be equal to one of the allowed values');
			}
		});
	});

	describe('getUserFromContext', () => {

		it('returns user id from context', () => {

			let contexts = [{
				user: { id: 'some@user.com' }
			}];

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			expect(notificationUtilitiesController.getUserFromContext(contexts)).to.equal(contexts[0].user.id);

		});

		it('returns user email from context', () => {

			let contexts = [{
				user: 'Pierce.Connelly@kathryne.org'
			}];

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			expect(notificationUtilitiesController.getUserFromContext(contexts)).to.equal(contexts[0].user);

		});
	});

	describe('getAccountFromContext', () => {

		it('returns account id from context', () => {

			let contexts = [{
				account: { id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c' }
			}];

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			expect(notificationUtilitiesController.getAccountFromContext(contexts)).to.equal(contexts[0].account.id);

		});

		it('returns account from context', () => {

			let contexts = [{
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
			}];

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			expect(notificationUtilitiesController.getAccountFromContext(contexts)).to.equal(contexts[0].account);

		});
	});
});
