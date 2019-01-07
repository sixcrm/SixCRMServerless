const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidTracker() {
	return MockEntities.getValidTracker()
}

function getValidAffiliate() {
	return MockEntities.getValidAffiliate()
}

function getValidCampaign() {
	return MockEntities.getValidCampaign()
}

describe('controllers/Tracker.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

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

	describe('getAffiliates', () => {

		it('successfully retrieves affiliates', () => {

			let tracker = getValidTracker();

			let affiliate = getValidAffiliate();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Affiliate.js'), class {
				listBy({list_array}) {
					expect(list_array).to.deep.equal(tracker.affiliates);
					return Promise.resolve({affiliates: [affiliate]});
				}
			});

			let TrackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');
			const trackerController = new TrackerController();

			return trackerController.getAffiliates(tracker).then((result) => {
				expect(result).to.deep.equal([affiliate]);
			});
		});

		it('returns null when tracker does not have affiliates', () => {

			let tracker = getValidTracker();

			delete tracker.affiliates;

			let TrackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');
			const trackerController = new TrackerController();

			expect(trackerController.getAffiliates(tracker)).to.deep.equal(null);
		});
	});

	describe('getCampaigns', () => {

		it('successfully retrieves campaigns', () => {

			let tracker = getValidTracker();

			let campaign = getValidCampaign();

			let mock_campaign = class {
				constructor(){}

				listBy ({list_array}) {
					expect(list_array).to.deep.equal(tracker.campaigns);
					return Promise.resolve({campaigns: [campaign]});
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let TrackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');
			const trackerController = new TrackerController();

			return trackerController.getCampaigns(tracker).then((result) => {
				expect(result).to.deep.equal([campaign]);
			});
		});

		it('returns null when tracker does not have campaigns', () => {

			let tracker = getValidTracker();

			delete tracker.campaigns;

			let TrackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');
			const trackerController = new TrackerController();

			expect(trackerController.getCampaigns(tracker)).to.deep.equal(null);
		});
	});

	describe('listByCampaign', () => {

		it('lists trackers by campaign', () => {

			let tracker = getValidTracker();

			let campaign = getValidCampaign();

			PermissionTestGenerators.givenUserWithAllowed('read', 'tracker');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('trackers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(campaign.id);
					return Promise.resolve({
						Count: 1,
						Items: [tracker]
					});
				}
			});

			let TrackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');
			const trackerController = new TrackerController();

			return trackerController.listByCampaign({campaign: campaign, pagination: 0}).then((result) => {
				expect(result).to.deep.equal({
					trackers: [tracker],
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					}
				});
			});
		});
	});

	describe('listByAffiliate', () => {

		it('lists trackers by affiliate', () => {

			let tracker = getValidTracker();

			let affiliate = getValidAffiliate();

			PermissionTestGenerators.givenUserWithAllowed('read', 'tracker');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('trackers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(affiliate.id);
					return Promise.resolve({
						Count: 1,
						Items: [tracker]
					});
				}
			});

			let TrackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');
			const trackerController = new TrackerController();

			return trackerController.listByAffiliate({affiliate: affiliate, pagination: 0}).then((result) => {
				expect(result).to.deep.equal({
					trackers: [tracker],
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					}
				});
			});
		});
	});
});
