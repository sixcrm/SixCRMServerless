const mockery = require('mockery');
const chai = require("chai");
const expect = chai.expect;
const path = require('path');
const fs = require('fs');
const au = global.SixCRM.routes.include('lib', 'array-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');

describe('controllers/workers/analytics/AnalyticsEventBroker', () => {

	before(() => {

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

	});

	after(() => {

		mockery.resetCache();
		mockery.deregisterAll();

	});

	describe('execute', () => {

		it('successfully executes against cases', () => {

			const eventsDir = path.join(__dirname, 'events');

			return fileutilities.getDirectoryFiles(eventsDir)
				.then((eventFiles) => {

					const paths = eventFiles.map(e => path.join(eventsDir, e));

					const tests = paths.map((p) => {

						return JSON.parse(fs.readFileSync(p, 'utf8'));

					});

					return au.serialPromises(au.map(tests, (test) => {

						const message = MockEntities.getValidSNSMessage(test.event);

						return new AnalyticsEventBroker().execute(message).then(result => {

							expect(result[0]).to.eql(test.result);

							return Promise.resolve();

						});

					}));

				});

		});

	});

});
