
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/workers/snsevents/trackingEvents', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.resetCache();
		mockery.deregisterAll();
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('instantiates the trackingEventsController class', () => {

			const TrackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');
			const trackingEventsController = new TrackingEventsController();

			expect(objectutilities.getClassName(trackingEventsController)).to.equal('TrackingEventsController');

		});

	});

	describe('execute', () => {

		it('successfully executes against cases', () => {

			let session  = MockEntities.getValidSession('668ad918-0d09-4116-a6fe-0e8a9eda36f7');
			let affiliate_ids = MockEntities.arrayOfIds(5);
			let trackers = MockEntities.getValidTrackers();

			let test_cases = [
				{
					message: {
						event_type:'lead',
						account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
						user:"system@sixcrm.com",
						context:{
							session: session
						}
					}
				}
			];

			return arrayutilities.reduce(test_cases, (current, test_case) => {

				let sns_message = MockEntities.getValidSNSMessage(test_case.message);

				mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
					get() {
						return Promise.resolve(session);
					}
					getAffiliateIDs() {
						return Promise.resolve(affiliate_ids);
					}
				});

				mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/postback-provider.js'), class {
					executePostback() {
						return Promise.resolve(true);
					}
				});

				mockery.registerMock(global.SixCRM.routes.path('entities', 'Tracker.js'), class {
					listByAffiliate() {
						return Promise.resolve(trackers);
					}
				});

				const TrackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');
				const trackingEventsController = new TrackingEventsController();

				return trackingEventsController.execute(sns_message);

			}, null);

		});

	});

});
