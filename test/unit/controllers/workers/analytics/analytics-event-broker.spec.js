const _ = require('underscore');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');

describe('controllers/workers/analytics/AnalyticsEventBroker', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.resetCache();
		mockery.deregisterAll();
	});

	beforeEach(() => {
		//global.SixCRM.localcache.clear('all');
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('execute', () => {

		it('successfully executes against cases', () => {

			let campaign = MockEntities.getValidCampaign();
			let session = MockEntities.getValidSession();

			objectutilities.map(session, key => {
				if (_.contains(['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'], key)) {
					delete session[key];
				}
			});

			let product_schedules = MockEntities.getValidProductSchedules();

			session.product_schedules = product_schedules;

			let products = MockEntities.getValidProducts();
			let affiliates = MockEntities.getValidRedshiftObjectAffiliates();
			let affiliates_in_result = {};

			objectutilities.map(affiliates, key => {
				session[key] = affiliates[key];
				affiliates_in_result[key] = affiliates[key];
			});

			let test_cases = [{
					message: {
						event_type: 'rebill',
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						user: "system@sixcrm.com",
						context: {
							eventMeta: { rebill: 'yes'},
							affiliates,
							campaign
						}
					},
					result: {
						type: 'rebill',
						eventMeta: { rebill: 'yes'}
					}
				},
				{
					message: {
						event_type: 'click',
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						user: "system@sixcrm.com",
						context: {
							affiliates,
							campaign
						}
					},
					result: {
						type: 'click',
						session: '',
						account: campaign.account,
						campaign: campaign.id
					}
				},
				{
					message: {
						event_type: 'lead',
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						user: "system@sixcrm.com",
						context: {
							session,
							campaign
						}
					},
					result: {
						type: 'lead',
						session: session.id,
						account: session.account,
						campaign: campaign.id,
						datetime: session.updated_at
					}
				},
				{
					message: {
						event_type: 'order',
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						user: "system@sixcrm.com",
						context: {
							session,
							campaign,
							product_schedules,
							products
						}
					},
					result: {
						type: 'order',
						session: session.id,
						campaign: campaign.id,
						account: campaign.account,
						product_schedules: arrayutilities.map(product_schedules, product_schedule => product_schedule.id),
						products: arrayutilities.map(products, product => product.id),
						datetime: session.updated_at
					}
				},
				{
					message: {
						event_type: 'confirm',
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						user: "system@sixcrm.com",
						context: {
							campaign,
							session
						}
					},
					result: {
						type: 'confirm',
						session: session.id,
						campaign: campaign.id,
						account: campaign.account,
						product_schedules: arrayutilities.map(product_schedules, product_schedule => product_schedule.id)
					}
				}
			];

			arrayutilities.map(test_cases, (test_case, index) => {
				test_cases[index].result = objectutilities.merge(test_case.result, affiliates_in_result);
			});

			return arrayutilities.reduce(test_cases, (current, test_case) => {

				let sns_message = MockEntities.getValidSNSMessage(test_case.message);

				mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
					sendMessage: () => {
						return Promise.resolve(true);
					}
				});

				return new AnalyticsEventBroker().execute(sns_message).then(result => {
					expect(result).to.equal(true);
					//expect(redshiftEventsController.parameters.store['redshiftobject']).to.deep.equal(test_case.result);
				});

			}, null);

		});

	});

});