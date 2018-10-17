let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidNotification() {
	return MockEntities.getValidNotification()
}

describe('controllers/Notification.js', () => {

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
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('numberOfUnseenNotifications', () => {

		it('returns number of unseen notifications', () => {

			let notification = getValidNotification();

			PermissionTestGenerators.givenUserWithAllowed('read', 'notification');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/NotificationRead.js'), class {
				getLastSeenTime() {
					return Promise.resolve(notification.updated_at)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				countRecords(table, additional_parameters, index) {
					expect(table).to.equal('notifications');
					expect(index).to.equal('user-index');
					expect(additional_parameters).to.have.property('expression_attribute_names');
					expect(additional_parameters).to.have.property('filter_expression');
					expect(additional_parameters).to.have.property('expression_attribute_values');
					expect(additional_parameters).to.have.property('key_condition_expression');
					return Promise.resolve({
						Count: 1
					});
				}
			});

			let NotificationController = global.SixCRM.routes.include('controllers','entities/Notification.js');
			const notificationController = new NotificationController();

			return notificationController.numberOfUnseenNotifications().then((result) => {
				expect(result).to.deep.equal({
					count: 1
				});
			});
		});

		it('throws error if response is missing the "Count" field', () => {

			let notification = getValidNotification();

			PermissionTestGenerators.givenUserWithAllowed('read', 'notification');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/NotificationRead.js'), class {
				getLastSeenTime() {
					return Promise.resolve(notification.updated_at)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				countRecords(table, additional_parameters, index) {
					expect(additional_parameters).to.have.property('expression_attribute_names');
					expect(additional_parameters).to.have.property('filter_expression');
					expect(additional_parameters).to.have.property('expression_attribute_values');
					expect(additional_parameters).to.have.property('key_condition_expression');
					expect(table).to.equal('notifications');
					expect(index).to.equal('user-index');
					return Promise.resolve({});
				}
			});

			let NotificationController = global.SixCRM.routes.include('controllers','entities/Notification.js');
			const notificationController = new NotificationController();

			return notificationController.numberOfUnseenNotifications().catch((error) => {
				expect(error.message).to.equal('[500] Object missing property "Count".');
			});
		});
	});

	describe('listByUser', () => {

		it('lists notifications by user', () => {

			let notification = getValidNotification();

			let params = {
				query_parameters: {},
				user: {
					id: 'dummy_id'
				},
				pagination: {
					limit:2
				}
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'notification');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/NotificationRead.js'), class {
				markNotificationsAsSeen() {
					return Promise.resolve({})
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('user-index');
					expect(table).to.equal('notifications');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':userv']).to.equal(params.user.id);
					return Promise.resolve({
						Count: 1,
						Items: [notification]
					});
				}
			});

			let NotificationController = global.SixCRM.routes.include('controllers','entities/Notification.js');
			const notificationController = new NotificationController();

			return notificationController.listByUser(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					notifications: [notification]
				});
			});
		});
	});

	describe('listByType', () => {

		it('lists notifications by type', () => {

			let notification = getValidNotification();

			let params = {
				types: ['a_type'],
				pagination: {
					limit:2
				}
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'notification');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('access_string-index');
					expect(table).to.equal('notifications');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('key_condition_expression');
					return Promise.resolve({
						Count: 1,
						Items: [notification]
					});
				}
			});

			let NotificationController = global.SixCRM.routes.include('controllers','entities/Notification.js');
			const notificationController = new NotificationController();

			return notificationController.listByType(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					notifications: [notification]
				});
			});
		});
	});
});
