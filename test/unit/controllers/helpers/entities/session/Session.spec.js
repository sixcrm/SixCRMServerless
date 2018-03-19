'use strict'
let chai = require('chai');
const mockery = require('mockery');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
let SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

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
        //global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    describe('constructor', () => {

        it('successfully calls the constructor', () => {
            let sessionControllerHelper = new SessionHelperController();

            expect(objectutilities.getClassName(sessionControllerHelper)).to.equal('SessionHelperController');
        });

    });

    describe('isComplete', () => {

        it('returns false when session is not completed', () => {
            let session = getValidSession();

            session.completed = false;

            let sessionControllerHelper = new SessionHelperController();

            expect(sessionControllerHelper.isComplete({session: session})).to.equal(false);
        });

        it('returns true when session is completed', () => {
            let session = getValidSession();

            session.completed = true;

            let sessionControllerHelper = new SessionHelperController();

            expect(sessionControllerHelper.isComplete({session: session})).to.equal(true);
        });

    });

    describe('isCurrent', () => {

        it('return false when session is expired', () => {
            let session = getValidSession();

            session.created_at = '2000-12-12T11:34:01.103Z'; //date in the past

            let sessionControllerHelper = new SessionHelperController();

            expect(sessionControllerHelper.isCurrent({session: session})).to.equal(false);
        });

        it('returns true when session is not expired', () => {
            let session = getValidSession();

            let sessionControllerHelper = new SessionHelperController();

            expect(sessionControllerHelper.isCurrent({session: session})).to.equal(true);
        });

    });

    describe('getSessionByCustomerAndID', () => {

        it('successfully retrieves session by customer and session id', () => {

            let session = getValidSession();

            let customer = getValidCustomer();

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
                get: () => {
                    return Promise.resolve(session);
                },
                getCustomer: () => {
                    return Promise.resolve(customer);
                }
            });

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

            let customer_email = randomutilities.createRandomEmail();

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
                get: () => {
                    return Promise.resolve(session);
                },
                getCustomer: () => {
                    return Promise.resolve(customer);
                }
            });

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

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
                get: () => {
                    return Promise.resolve(null);
                }
            });

            let sessionControllerHelper = new SessionHelperController();

            return sessionControllerHelper.getSessionByCustomerAndID({
                customer: customer.email,
                id: session.id
            }).then((result) => {
                return expect(result).to.equal(null);
            });
        });

        it('returns null when session controller is set but session with specified id does not exist', () => {

            let session = getValidSession();

            let customer = getValidCustomer();

            let sessionControllerHelper = new SessionHelperController();

            sessionControllerHelper.sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

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

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
                getCustomerByEmail: () => {
                    return Promise.resolve(customer);
                },
                getCustomerSessions: () => {
                    return Promise.resolve([session]);
                }
            });

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

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
                getCustomerByEmail: () => {
                    return Promise.resolve(customer);
                },
                getCustomerSessions: () => {
                    return Promise.resolve([session]);
                }
            });

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

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
                getCustomerByEmail: () => {
                    return Promise.resolve(null);
                }
            });

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

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
                getCustomerByEmail: () => {
                    return Promise.resolve(customer);
                },
                getCustomerSessions: () => {
                    return Promise.resolve([]);
                }
            });

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

            let sessionControllerHelper = new SessionHelperController();

            sessionControllerHelper.customerController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

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
