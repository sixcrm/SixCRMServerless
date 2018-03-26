const mockery = require('mockery');

mockery.enable({
	useCleanCache: true,
	warnOnReplace: false,
	warnOnUnregistered: false
});

mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
	sendMessage: () => {
		return Promise.resolve(true);
	}
});

const chai = require("chai");
const expect = chai.expect;
const path = require('path');
const fs = require('fs');
const BBPromise = require('bluebird');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');

describe('controllers/workers/analytics/AnalyticsEventBroker', () => {

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

					return BBPromise.each(tests, (test) => {

						const message = MockEntities.getValidSNSMessage(test.event);

						return new AnalyticsEventBroker().execute(message).then(result => {

							return expect(result[0]).to.eql(test.result);

						});

					});

				});

		});

	});

});
