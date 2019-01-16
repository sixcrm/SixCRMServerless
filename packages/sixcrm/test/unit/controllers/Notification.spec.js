const PermissionTestGenerators = require('../lib/permission-test-generators');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

describe('controllers/Notification.js', () => {

	describe('count notifications', () => {
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
			global.disableactionchecks = false;
		});

		it('should return number of notifications after last seen date', () => {
			// given
			global.disableactionchecks = true;
			PermissionTestGenerators.givenAnyUser();

			//Technical Debt:  Fix...
			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				get() {
					return Promise.resolve({
						id: "nikola.bosic@toptal.com/*",
						created_at: "2017-04-06T18:40:41.405Z",
						updated_at: "2017-04-06T18:41:12.521Z"
					})
				}
				queryRecords() {
					return Promise.resolve({ Count: 2})
				}
				saveRecord() {
					return Promise.resolve({});
				}
				countRecords() {
					return Promise.resolve({ Count: 2});
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			let NotificationController = global.SixCRM.routes.include('controllers','entities/Notification');
			const notificationController = new NotificationController();

			// when
			return notificationController.numberOfUnseenNotifications().then((count) => {
				// then
				return expect(count).to.deep.equal({ count: 2});
			});

		});

	});

});
