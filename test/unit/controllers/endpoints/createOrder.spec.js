const mockery = require('mockery');
const PermissionTestGenerators = global.routes.include('test','unit/lib/permission-test-generators');

let chai = require('chai');
let expect = chai.expect;

describe('controllers/endpoints/createOrder.js', () => {
    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    it('acquires body', () => {
        let endpointController = global.routes.include('controllers','endpoints/createOrder');
        let anEvent = {
            body: 'abc'
        };

        return endpointController.acquireBody(anEvent).then((body) => {
            return expect(body).to.equal(anEvent.body);
        });
    });

    it('doesn\'t get order info outside of session', () => {
        PermissionTestGenerators.givenUserWithAllowed('read', 'creditcard');
        let eventBody = {
            session_id: 1,
            campaign_id: 1,
            product_schedules: 1,
            ccnumber: '',
            ccexpiration: '',
            address: '',
            name: ''
        };

        mockery.registerMock(global.routes.path('controllers','entities/Session.js'), {
            get: () => {
                return Promise.resolve({});
            }
        });

        mockery.registerMock(global.routes.path('controllers','entities/Campaign.js'), {
            getHydratedCampaign: () => {
                return Promise.resolve({});
            }
        });

        mockery.registerMock(global.routes.path('controllers','entities/entities/ProductSchedule.js'), {
            getProductSchedules: () => {
                return Promise.resolve([]);
            }
        });

        mockery.registerMock(global.routes.path('controllers','entities/entities/CreditCard.js'), {
            createCreditCardObject: () => {
                return Promise.resolve([]);
            },
            storeCreditCard: () => {
                return Promise.resolve();
            }
        });


        let endpointController = global.routes.include('controllers','endpoints/createOrder.js');
        return endpointController.getOrderInfo(eventBody).catch((error) => {
            return expect(error.message).to.equal('No available session.');
        });
    });

    it('doesn\'t get order info without campaign', () => {
        PermissionTestGenerators.givenUserWithAllowed('read', 'creditcard');
        let eventBody = {
            session_id: 1,
            campaign_id: 1,
            product_schedules: 1,
            ccnumber: '',
            ccexpiration: '',
            address: '',
            name: ''
        };

        mockery.registerMock('../../controllers/Session.js', {
            get: () => {
                return Promise.resolve({
                    id: 1
                });
            }
        });

        mockery.registerMock('../../controllers/Campaign.js', {
            getHydratedCampaign: () => {
                return Promise.resolve({});
            }
        });

        mockery.registerMock('../../controllers/ProductSchedule.js', {
            getProductSchedules: () => {
                return Promise.resolve([]);
            }
        });

        mockery.registerMock('../../controllers/CreditCard.js', {
            createCreditCardObject: () => {
                return Promise.resolve([]);
            },
            storeCreditCard: () => {
                return Promise.resolve();
            }
        });


        let endpointController = global.routes.include('controllers','endpoints/createOrder');
        return endpointController.getOrderInfo(eventBody).catch((error) => {
            return expect(error.message).to.equal('No available campaign.');
        });
    });

    it('doesn\'t get order info without a credit card', () => {
        PermissionTestGenerators.givenUserWithAllowed('read', 'creditcard');
        let eventBody = {
            session_id: 1,
            campaign_id: 1,
            product_schedules: 1,
            ccnumber: '',
            ccexpiration: '',
            address: '',
            name: ''
        };

        mockery.registerMock('../../controllers/Session.js', {
            get: () => {
                return Promise.resolve({
                    id: 1
                });
            }
        });

        mockery.registerMock('../../controllers/Campaign.js', {
            getHydratedCampaign: () => {
                return Promise.resolve({
                    id: 1
                });
            }
        });

        mockery.registerMock('../../controllers/ProductSchedule.js', {
            getProductSchedules: () => {
                return Promise.resolve([]);
            }
        });

        mockery.registerMock('../../controllers/CreditCard.js', {
            createCreditCardObject: () => {
                return Promise.resolve([]);
            },
            storeCreditCard: () => {
                return Promise.resolve();
            }
        });


        let endpointController = require('../../../../controllers/endpoints/createOrder');
        return endpointController.getOrderInfo(eventBody).catch((error) => {
            return expect(error.message).to.equal('No available creditcard.');
        });
    });
});
