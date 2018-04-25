const mockery = require('mockery');

before(() => {

	mockery.enable({
		useCleanCache: true,
		warnOnReplace: false,
		warnOnUnregistered: false
	});

	mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
		constructor() {}
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
