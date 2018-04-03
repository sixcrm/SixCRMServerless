const mockery = require('mockery');

before(() => {

	mockery.enable({
		useCleanCache: true,
		warnOnReplace: false,
		warnOnUnregistered: false
	});

	mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/sns-provider.js'), class {
		publish() {
			return Promise.resolve({});
		}
		getRegion() {
			return 'localhost';
		}
	});

});

after(() => {

	mockery.resetCache();
	mockery.deregisterAll();

});
