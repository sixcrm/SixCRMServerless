
let chai = require('chai');
const mockery = require('mockery');
const expect = chai.expect;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const spoofer = global.SixCRM.routes.include('test', 'spoofer.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidSession() {
	return MockEntities.getValidSession()
}

function getValidCustomer() {
	return MockEntities.getValidCustomer()
}

describe('/helpers/entities/session/Session.js', () => {

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
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully calls the constructor', () => {

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			expect(objectutilities.getClassName(sessionControllerHelper)).to.equal('SessionHelperController');
		});

	});

	describe('isComplete', () => {

		it('returns false when session is not completed', () => {
			let session = getValidSession();

			session.completed = false;

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			expect(sessionControllerHelper.isComplete({session: session})).to.equal(false);
		});

		it('returns true when session is completed', () => {
			let session = getValidSession();

			session.completed = true;

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			expect(sessionControllerHelper.isComplete({session: session})).to.equal(true);
		});

	});

	describe('isCurrent', () => {

		it('return false when session is expired', () => {
			let session = getValidSession();

			session.created_at = '2000-12-12T11:34:01.103Z'; //date in the past

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			expect(sessionControllerHelper.isCurrent({session: session})).to.equal(false);
		});

		it('returns true when session is not expired', () => {
			let session = getValidSession();

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			expect(sessionControllerHelper.isCurrent({session: session})).to.equal(true);
		});

	});

	describe('getSessionByCustomerAndID', () => {

		it('successfully retrieves session by customer and session id', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session);
				}
				getCustomer() {
					return Promise.resolve(customer);
				}
			});

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndID({
				customer: customer.email,
				id: session.id
			}).then((result) => {
				return expect(result).to.deep.equal(session);
			});
		});

		it('returns null when there is no match for customer email', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			let customer_email = spoofer.createRandomEmail();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session);
				}
				getCustomer() {
					return Promise.resolve(customer);
				}
			});

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndID({
				customer: customer_email,
				id: session.id
			}).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns null when session with specified id does not exist', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(null);
				}
			});

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndID({
				customer: customer.email,
				id: session.id
			}).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns null when session controller is set but session with specified id does not exist', () => {

			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');

			let session = getValidSession();

			let customer = getValidCustomer();

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			sessionControllerHelper.sessionController = new SessionController();

			sessionControllerHelper.sessionController.get = ({id}) => {
				expect(id).to.equal(session.id);
				return Promise.resolve(null)
			};

			return sessionControllerHelper.getSessionByCustomerAndID({
				customer: customer.email,
				id: session.id
			}).then((result) => {
				return expect(result).to.equal(null);
			});
		});

	});

	describe('getSessionByCustomerAndAlias', () => {

		it('successfully retrieves session by customer email and session alias', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(customer);
				}
				getCustomerSessions() {
					return Promise.resolve([session]);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndAlias({
				customer: customer.email,
				alias: session.alias
			}).then((result) => {
				return expect(result).to.deep.equal(session);
			});
		});

		it('returns null when there is no session with specified alias', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			let session_alias = 'S'+randomutilities.createRandomString(9);

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(customer);
				}
				getCustomerSessions() {
					return Promise.resolve([session]);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndAlias({
				customer: customer.email,
				alias: session_alias
			}).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns null when there is no customer with specified email', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(null);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndAlias({
				customer: customer.email,
				alias: session.alias
			}).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns null when there is no session for specified customer email', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(customer);
				}
				getCustomerSessions() {
					return Promise.resolve([]);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			return sessionControllerHelper.getSessionByCustomerAndAlias({
				customer: customer.email,
				alias: session.alias
			}).then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns null when customer controller is set but there is no customer with specified email', () => {

			let session = getValidSession();

			let customer = getValidCustomer();

			let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
			let sessionControllerHelper = new SessionHelperController();

			sessionControllerHelper.customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

			sessionControllerHelper.customerController.getCustomerByEmail = (email) => {
				expect(email).to.equal(customer.email);
				return Promise.resolve(null)
			};

			return sessionControllerHelper.getSessionByCustomerAndAlias({
				customer: customer.email,
				alias: session.alias
			}).then((result) => {
				return expect(result).to.deep.equal(null);
			});
		});

	});

});
