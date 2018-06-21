
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

		it('returns an null', () => {

			let context = "{\"id\":\"83f809ad-938f-4695-963f-7b4c76a8bc9d\",\"event\":{\"account\":\"3f4abaf6-52ac-40c6-b155-d04caeb0391f\",\"campaign\":\"8b60000e-6a6b-4807-94d1-f737da089ee5\"},\"campaign\":{\"updated_at\":\"2018-06-21T19:18:47.025Z\",\"created_at\":\"2018-06-19T00:42:16.413Z\",\"productschedules\":[],\"emailtemplates\":[],\"allow_prepaid\":false,\"affiliate_allow\":[],\"account\":\"3f4abaf6-52ac-40c6-b155-d04caeb0391f\",\"show_prepaid\":false,\"allow_on_order_form\":true,\"affiliate_deny\":[],\"id\":\"8b60000e-6a6b-4807-94d1-f737da089ee5\",\"name\":\"Six Billing\"},\"transactionjwt\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2RldmVsb3BtZW50LWFwaS5zaXhjcm0uY29tIiwic3ViIjoiIiwiYXVkIjoiIiwiaWF0IjoxNTI5NjEwNTI1LCJleHAiOjE1Mjk2MTQxMjUsInVzZXJfYWxpYXMiOiI2MGZjOGNjYzg1ZDhiN2U2ZWFhZTMzM2JiMjBkMmRiNTFhYTM3NjkzIn0.8V0gc9iZNjh-ipUgoiPHIc08ekd6gU4hCd7AeRzWsl4\",\"user\":{\"updated_at\":\"2018-06-21T19:18:50.139Z\",\"alias\":\"60fc8ccc85d8b7e6eaae333bb20d2db51aa37693\",\"auth0_id\":\"google-oauth2|115021313586107803846\",\"active\":true,\"created_at\":\"2018-04-12T19:28:35.542Z\",\"last_name\":\"User\",\"first_name\":\"System\",\"termsandconditions\":\"0.1\",\"id\":\"system@sixcrm.com\",\"name\":\"System User\",\"acl\":[{\"updated_at\":\"2018-06-21T19:18:49.713Z\",\"created_at\":\"2018-04-12T19:28:32.231Z\",\"role\":{\"updated_at\":\"2018-06-21T19:18:48.978Z\",\"active\":true,\"created_at\":\"2018-04-12T19:28:21.647Z\",\"permissions\":{\"allow\":[\"*\"]},\"account\":\"*\",\"id\":\"cae614de-ce8a-40b9-8137-3d3bdff78039\",\"name\":\"Owner\"},\"account\":{\"updated_at\":\"2018-06-21T19:18:46.763Z\",\"active\":true,\"created_at\":\"2018-04-13T14:49:22.474Z\",\"id\":\"*\",\"name\":\"Master Account\",\"name_lowercase\":\"master account\",\"billing\":{\"plan\":\"free\"}},\"user\":\"system@sixcrm.com\",\"termsandconditions\":\"0.1\",\"id\":\"a7ee4036-bdd4-4a38-91c9-da766ce36668\"}]}}";

			let NotificationUtilitiesController = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/components/NotificationUtilities.js');
			const notificationUtilitiesController = new NotificationUtilitiesController();

			let result = notificationUtilitiesController.getUserFromContext(context);
			expect(result).to.equal(null);

		});

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
