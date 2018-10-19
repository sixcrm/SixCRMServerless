let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidSession() {
	return MockEntities.getValidSession()
}

describe('controllers/helpers/entities/tracker/Tracker.js', () => {

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

	describe('executeAffiliatesTracking', () => {

		it('returns null when there aren\'t any affiliate identifiers', () => {

			let affiliate_ids = [];

			let data = 'Some sample data';

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeAffiliatesTracking(affiliate_ids, data).then((result) => {
				return expect(result).to.equal(null);
			});

		});

		it('successfully executes affiliates tracking', () => {

			let affiliate_ids = ['6b6331f6-7f84-437a-9ac6-093ba301e455'];

			let data = 'Some sample data';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), class {
				listByAffiliate() {
					return Promise.resolve([{type: 'postback'}]);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/postback-provider.js'), class {
				executePostback() {
					return Promise.resolve('sample transaction execution');
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeAffiliatesTracking(affiliate_ids, data).then((result) => {
				return expect(result).to.deep.equal([['sample transaction execution']]);
			});
		});
	});

	describe('executeAffiliateTrackers', () => {

		it('returns null when there aren\'t any trackers associated with this affiliate', () => {

			let affiliate_id = '6b6331f6-7f84-437a-9ac6-093ba301e455';

			let data = 'Some sample data';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), class {
				listByAffiliate() {
					return Promise.resolve('not an array');
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeAffiliateTrackers(affiliate_id, data).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('successfully executes affiliate trackers', () => {

			let affiliate_id = '6b6331f6-7f84-437a-9ac6-093ba301e455';

			let data = 'Some sample data';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), class {
				listByAffiliate() {
					return Promise.resolve([{type: 'postback'}]);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/postback-provider.js'), class {
				executePostback() {
					return Promise.resolve('sample transaction execution');
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeAffiliateTrackers(affiliate_id, data).then((result) => {
				return expect(result).to.deep.equal(['sample transaction execution']);
			});
		});

		it('returns null when tracker controller is set but there aren\'t any trackers associated with this affiliate', () => {

			const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');

			let affiliate_id = getValidSession().affiliate;

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			trackerHelperController.trackerController = new TrackerController();
			trackerHelperController.trackerController.listByAffiliate = ({affiliate}) => {
				expect(affiliate).to.equal(affiliate_id);
				return Promise.resolve('');
			};

			return trackerHelperController.executeAffiliateTrackers(affiliate_id, {}).then((result) => {
				return expect(result).to.equal(null);
			});
		});
	});

	describe('executeTracker', () => {

		it('successfully executes tracker when type is postback', () => {

			let tracker = {type: 'postback'};

			let data = 'Some sample data';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/postback-provider.js'), class {
				executePostback() {
					return Promise.resolve('sample transaction execution');
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeTracker(tracker, data).then((result) => {
				return expect(result).to.equal('sample transaction execution');
			});
		});

		it('returns null when tracker has HTML type', () => {

			let tracker = {type: 'html'};

			let data = 'Some sample data';

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeTracker(tracker, data).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns null when tracker has HTML type', () => {

			let tracker = {type: 'unexpected type'};

			let data = 'Some sample data';

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.executeTracker(tracker, data)
				.catch(error => expect(error.message).to.equal('[500] Unrecognized Tracker type: unexpected type'));
		});
	});

	describe('getAffiliateIDsFromSession', () => {

		it('retrieves affiliate ids from session', () => {

			let session = getValidSession();

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.getAffiliateIDsFromSession(session.id).then((result) => {
				return expect(result).to.deep.equal([
					"affiliate",
					"subaffiliate_1",
					"subaffiliate_2",
					"subaffiliate_3",
					"subaffiliate_4",
					"subaffiliate_5",
					"cid"
				]);
			});
		});

		it('returns only valid session affiliate ids', () => {

			let session = getValidSession();

			session.affiliate = "not_an_UUID";
			session.subaffiliate_1 = "not_an_UUID";
			session.subaffiliate_2 = "not_an_UUID";

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.getAffiliateIDsFromSession(session.id).then((result) => {
				return expect(result).to.deep.equal([
					"subaffiliate_3",
					"subaffiliate_4",
					"subaffiliate_5",
					"cid"
				]);
			});
		});

		it('retrieves valid affiliate ids from session when session controller is already set', () => {

			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');

			let session = getValidSession();

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			trackerHelperController.sessionController = new SessionController();
			trackerHelperController.sessionController.getAffiliateIDs = (id) => {
				expect(id).to.equal(session.id);
				return Promise.resolve([
					"affiliate",
					"cid"
				]);
			};

			return trackerHelperController.getAffiliateIDsFromSession(session.id).then((result) => {
				return expect(result).to.deep.equal([
					"affiliate",
					"cid"
				]);
			});
		});
	});

	describe('handleTracking', () => {

		it('successfully handles tracking for session with affiliate (postback type)', () => {

			let session = getValidSession();

			let data = 'Some sample data';

			delete session.affiliate;
			delete session.subaffiliate_1;
			delete session.subaffiliate_3;
			delete session.subaffiliate_4;
			delete session.subaffiliate_5;
			delete session.cid;

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), class {
				listByAffiliate({affiliate}) {
					expect(affiliate).to.equal("subaffiliate_2");
					return Promise.resolve([{
						type: 'postback' //returns valid tracker type
					}]);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/postback-provider.js'), class {
				executePostback() {
					return Promise.resolve('sample transaction execution');
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.handleTracking(session.id, data).then((result) => {
				return expect(result).to.deep.equal([['sample transaction execution']]);
			});
		});

		it('successfully handles tracking for session with affiliate (html type)', () => {

			let session = getValidSession();

			let data = 'Some sample data';

			delete session.affiliate;
			delete session.subaffiliate_1;
			delete session.subaffiliate_3;
			delete session.subaffiliate_4;
			delete session.subaffiliate_5;
			delete session.cid;

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), class {
				listByAffiliate({affiliate}) {
					expect(affiliate).to.equal("subaffiliate_2");
					return Promise.resolve([{
						type: 'html' //returns valid tracker type
					}]);
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.handleTracking(session.id, data).then((result) => {
				return expect(result).to.deep.equal([[null]]);
			});
		});

		it('throws error when tracker type is unrecognized', () => {

			let session = getValidSession();

			let data = 'Some sample data';

			delete session.affiliate;
			delete session.subaffiliate_1;
			delete session.subaffiliate_3;
			delete session.subaffiliate_4;
			delete session.subaffiliate_5;
			delete session.cid;

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), class {
				listByAffiliate({affiliate}) {
					expect(affiliate).to.equal("subaffiliate_2");
					return Promise.resolve([{
						type: 'invalid_tracker_type'
					}]);
				}
			});

			const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');
			let trackerHelperController = new TrackerHelperController();

			return trackerHelperController.handleTracking(session.id, data).catch((error) => {
				return expect(error.message).to.equal('[500] Unrecognized Tracker type: invalid_tracker_type');
			});
		});
	});
});
