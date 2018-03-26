const _ = require('underscore');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const path = require('path');
const fs = require('fs');

const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
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

		mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
			sendMessage: () => {
				return Promise.resolve(true);
			}
		});

	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('execute', () => {

		it('successfully executes against cases', () => {

			let session = MockEntities.getValidSession();

			objectutilities.map(session, key => {
				if (_.contains(['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'], key)) {
					delete session[key];
				}
			});

			let product_schedules = MockEntities.getValidProductSchedules();

			session.product_schedules = product_schedules;

			let affiliates = MockEntities.getValidRedshiftObjectAffiliates();
			let affiliates_in_result = {};

			objectutilities.map(affiliates, key => {
				session[key] = affiliates[key];
				affiliates_in_result[key] = affiliates[key];
			});

			const eventsDir = path.join(__dirname, 'events');
			return fileutilities.getDirectoryFiles(eventsDir)
				.then((eventFiles) => {

					const paths = eventFiles.map(e => path.join(eventsDir, e));

					return paths.map((p) => {

						const event = JSON.parse(fs.readFileSync(p, 'utf8'));

						let sns_message = MockEntities.getValidSNSMessage(event);

						return new AnalyticsEventBroker().execute(sns_message).then(result => {
							// expect(result).to.equal(true);

							console.log(require('util').inspect(result, { depth: null}));

							//expect(redshiftEventsController.parameters.store['redshiftobject']).to.deep.equal(test_case.result);
						
						});

					});

				});

		});

	});

});