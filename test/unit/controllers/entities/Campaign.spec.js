let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/Campaign.js', () => {

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

	describe('getAffiliateAllowDenyList', () => {

		it('returns affiliate allow/deny list', () => {

			//any uuid or *
			let list = ['*', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'];

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Affiliate.js'), class {
				listBy({list_array}) {
					expect(list_array).to.deep.equal([list[1]]);
					return Promise.resolve({affiliates: ['an_affiliate']})
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getAffiliateAllowDenyList(list).then((result) => {
				expect(result).to.deep.equal([
					'an_affiliate',
					{
						id: '*',
						name: 'All'
					}
				]);
			});
		});

		it('returns only "*" elements of the list when there are no affiliates matching specified UUIDs', () => {

			//any uuid or *
			let list = ['*', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'];

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Affiliate.js'), class {
				listBy({list_array}) {
					expect(list_array).to.deep.equal([list[1]]);
					return Promise.resolve({affiliates: []})
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getAffiliateAllowDenyList(list).then((result) => {
				expect(result).to.deep.equal([
					{
						id: '*',
						name: 'All'
					}
				]);
			});
		});

		it('returns null when list is empty', () => {

			let list = [];

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getAffiliateAllowDenyList(list).then((result) => {
				expect(result).to.equal(null);
			});
		});

		it('returns null when list does not contain valid elements', () => {

			let list = ['unexpected_element', '123', '-123', '', 123, 11.22, -123, {}, [], () => {}];

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getAffiliateAllowDenyList(list).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('getEmailTemplates', () => {

		it('successfully retrieves email templates', () => {
			let campaign = {
				emailtemplates: ['an_email_template_id']
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/EmailTemplate.js'), class {
				listBy({list_array}) {
					expect(list_array).to.deep.equal(campaign.emailtemplates);
					return Promise.resolve({emailtemplates: ['an_email_template']})
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getEmailTemplates(campaign).then((result) => {
				expect(result).to.deep.equal(['an_email_template']);
			});
		});

		it('returns null when campaign does not have an email template', () => {
			let campaign = {};

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getEmailTemplates(campaign).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('getProductSchedules', () => {

		it('successfully retrieves product schedules', () => {
			let campaign = {
				productschedules: ['a_product_schedule_id']
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), class {
				listBy({list_array}) {
					expect(list_array).to.deep.equal(campaign.productschedules);
					return Promise.resolve({productschedules: ['a_product_schedule']})
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getProductSchedules(campaign).then((result) => {
				expect(result).to.deep.equal(['a_product_schedule']);
			});
		});

		it('returns null when campaign does not have a product schedule', () => {
			let campaign = {};

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.getProductSchedules(campaign).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('listByAffiliateAllow', () => {

		it('successfully lists by affiliate allow', () => {
			let params = {
				affiliate: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'campaign');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('campaigns');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_names['#f1']).to.equal('affiliate_allow');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(params.affiliate.id);
					return Promise.resolve({
						Count: 1,
						Items: ['a_campaign']
					});
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.listByAffiliateAllow(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					campaigns: ['a_campaign']
				});
			});
		});
	});

	describe('listByAffiliateDeny', () => {

		it('successfully lists by affiliate deny', () => {
			let params = {
				affiliate: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'campaign');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('campaigns');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_names['#f1']).to.equal('affiliate_deny');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(params.affiliate.id);
					return Promise.resolve({
						Count: 1,
						Items: ['a_campaign']
					});
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.listByAffiliateDeny(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					campaigns: ['a_campaign']
				});
			});
		});
	});

	describe('listCampaignsByProductSchedule', () => {

		it('successfully lists campaigns by product schedule', () => {
			let params = {
				productschedule: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'campaign');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('campaigns');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_names['#f1']).to.equal('productschedules');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(params.productschedule.id);
					return Promise.resolve({
						Count: 1,
						Items: ['a_campaign']
					});
				}
			});

			let CampaignController = global.SixCRM.routes.include('controllers','entities/Campaign.js');
			const campaignController = new CampaignController();

			return campaignController.listCampaignsByProductSchedule(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					campaigns: ['a_campaign']
				});
			});
		});
	});
});
