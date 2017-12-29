let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidSession() {
    return {
        "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "customer": "24f7c851-29d4-4af9-87c5-0298fa74c689",
        "campaign":"70a6689a-5814-438b-b9fd-dd484d0812f9",
        "product_schedules":[],
        "completed": false,
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z",
        "affiliate":	"332611c7-8940-42b5-b097-c49a765e055a",
        "subaffiliate_1":	"6b6331f6-7f84-437a-9ac6-093ba301e455",
        "subaffiliate_2":	"22524f47-9db7-42f9-9540-d34a8909b072",
        "subaffiliate_3":	"fd2548db-66a8-481e-aacc-b2b76a88fea7",
        "subaffiliate_4":	"d515c0df-f9e4-4a87-8fe8-c53dcace0995",
        "subaffiliate_5":	"45f025bb-a9dc-45c7-86d8-d4b7a4443426",
        "cid":"fb10d33f-da7d-4765-9b2b-4e5e42287726"
    }
}

describe('controllers/Session.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    describe('getAffiliateIDs', () => {

        it('successfully retrieves affiliate IDs', () => {
            let session = getValidSession();

            PermissionTestGenerators.givenUserWithAllowed('read', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({
                        Items: [session]
                    });
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getAffiliateIDs(session.id).then((result) => {
                expect(result).to.deep.equal([
                    "affiliate",
                    "subaffiliate_1",
                    "subaffiliate_2",
                    "subaffiliate_3",
                    "subaffiliate_4",
                    "subaffiliate_5",
                    "cid"
                ]);
            });
        });

        it('returns an empty array when affiliate field type is unrecognized', () => {
            let session = getValidSession();

            session.affiliate = 111;
            session.subaffiliate_1 = {};
            session.subaffiliate_2 = [];
            session.subaffiliate_3 = -111;
            session.subaffiliate_4 = 11.22;
            session.subaffiliate_5 = "111";
            session.cid = "any string";

            PermissionTestGenerators.givenUserWithAllowed('read', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({
                        Items: [session]
                    });
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getAffiliateIDs(session.id).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when affiliate fields are missing', () => {
            let session = {
                id: "dummy_id"
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({
                        Items: [session]
                    });
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getAffiliateIDs(session.id).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });
    });

    describe('getCampaign', () => {

        it('returns null when session does not have a campaign data', () => {
            let session = getValidSession();

            delete session.campaign;

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            expect(sessionController.getCampaign(session)).to.equal(null);
        });

        it('successfully retrieves campaign', () => {
            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Campaign.js'), {
                get: ({id}) => {
                    expect(id).to.equal(session.campaign);
                    return Promise.resolve('a_campaign');
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getCampaign(session).then((result) => {
                expect(result).to.equal('a_campaign');
            });
        });
    });

    describe('getCustomer', () => {

        it('returns null when session does not have a customer data', () => {
            let session = getValidSession();

            delete session.customer;

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            expect(sessionController.getCustomer(session)).to.equal(null);
        });

        it('successfully retrieves customer', () => {
            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Customer.js'), {
                get: ({id}) => {
                    expect(id).to.equal(session.customer);
                    return Promise.resolve('a_customer');
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getCustomer(session).then((result) => {
                expect(result).to.equal('a_customer');
            });
        });
    });

    describe('getCampaignHydrated', () => {

        it('returns hydrated campaign', () => {
            let session = getValidSession();

            let hydrated_campaign = {
                productschedules: ['a_product_schedule']
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Campaign.js'), {
                getHydratedCampaign: ({id}) => {
                    expect(id).to.equal(session.id);
                    return Promise.resolve(hydrated_campaign);
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getCampaignHydrated(session).then((result) => {
                expect(result).to.equal(hydrated_campaign);
            });
        });
    });

    describe('getAffiliate', () => {

        it('successfully acquires affiliate', () => {
            let session = getValidSession();

            let affiliate_field = "subaffiliate_1"; //valid field

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Affiliate.js'), {
                get: ({id}) => {
                    expect(id).to.equal(session[affiliate_field]);
                    return Promise.resolve('an_affiliate');
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getAffiliate(session, affiliate_field).then((result) => {
                expect(result).to.equal('an_affiliate');
            });
        });

        it('returns null when affiliate field is not valid UUID', () => {
            let session = getValidSession();

            let affiliate_field = "subaffiliate_1";

            session.subaffiliate_1 = "some random value"; //unexpected value

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            expect(sessionController.getAffiliate(session, affiliate_field)).to.equal(null);
        });

        it('returns null when session does not have appointed affiliate field', () => {
            let session = getValidSession();

            let affiliate_field = "some_random_value"; //invalid field

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            expect(sessionController.getAffiliate(session, affiliate_field)).to.equal(null);
        });
    });

    describe('listByAffiliate', () => {

        it('lists sessions by affiliate', () => {
            let session = getValidSession();

            let params = {
                affiliate: {
                    id: 'dummy_id'
                },
                pagination: 0
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('sessions');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':affiliate_id']).to.equal(params.affiliate.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [session]
                    });
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listByAffiliate(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    sessions: [session]
                });
            });
        });
    });

    describe('listRebills', () => {

        it('successfully lists rebills', () => {
            let session_data = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), {
                listBySession: ({session}) => {
                    expect(session).to.equal(session_data);
                    return Promise.resolve({rebills: ['a_rebill']});
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listRebills(session_data).then((result) => {
                expect(result).to.deep.equal(['a_rebill']);
            });
        });
    });

    describe('listProductSchedules', () => {

        it('returns null when session does not have a product schedule', () => {
            let session = getValidSession();

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listProductSchedules(session).then((result) => {
                expect(result).to.deep.equal(null);
            });
        });

        it('successfully lists product schedules', () => {
            let session = getValidSession();

            session.product_schedules = ['a_product_schedule_id'];

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                createINQueryParameters: (field, list_array) => {
                    expect(field).to.equal('id');
                    expect(list_array).to.equal(session.product_schedules);
                    return Promise.resolve({
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    })
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/ProductSchedule.js'), {
                listByAccount: ({query_parameters}) => {
                    return Promise.resolve(['a_product_schedule']);
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listProductSchedules(session).then((result) => {
                expect(result).to.deep.equal(['a_product_schedule']);
            });
        });
    });

    describe('listByCampaign', () => {

        it('list sessions by campaign', () => {
            let session = getValidSession();

            let params = {
                campaign: {
                    id: 'dummy_id'
                },
                pagination: 0
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('sessions');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':field_value']).to.equal(params.campaign.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [session]
                    });
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listByCampaign(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    sessions: [session]
                });
            });
        });
    });

    describe('getSessionByCustomer', () => {

        it('retrieves session by customer', () => {
            let session = getValidSession();

            let customer = {
                id: 'dummy_id'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    expect(table).to.equal('sessions');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(index).to.equal('customer-index');
                    expect(parameters.expression_attribute_values[':index_valuev']).to.equal(customer.id);
                    return Promise.resolve({ Items: [{sessions: session}] });
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.getSessionByCustomer(customer).then((result) => {
                expect(result).to.deep.equal([{sessions: session}]);
            });
        });
    });

    describe('closeSession', () => {

        it('successfully closes session', () => {
            let session = getValidSession();

            let updatedSession = session;
            updatedSession.completed = true;

            PermissionTestGenerators.givenUserWithAllowed('update', 'session');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(table).to.equal('sessions');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(session.id);
                    return Promise.resolve({Items: [session]});
                },
                saveRecord: (tableName, entity) => {
                    expect(entity).to.deep.equal(session);
                    expect(tableName).to.equal('sessions');
                    return Promise.resolve(updatedSession);
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.closeSession(session).then((result) => {
                expect(result).to.deep.equal(updatedSession);
            });
        });
    });

    describe('listTransactions', () => {

        it('returns null when session does not have rebills', () => {

            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), {
                listBySession: (session) => {
                    return Promise.resolve('session without rebills');
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listTransactions(session).then((result) => {
                expect(result).to.equal(null);
            });
        });

        it('returns null when session rebills list is empty', () => {

            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), {
                listBySession: (session) => {
                    return Promise.resolve({rebills : []});
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listTransactions(session).then((result) => {
                expect(result).to.equal(null);
            });
        });

        it('returns null when transaction list is empty', () => {

            let session = getValidSession();

            let session_rebills = {
                rebills: [{
                    id: 'dummy_id'
                }]
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), {
                listBySession: (session) => {
                    return Promise.resolve(session_rebills);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), {
                listTransactionsByRebillID: ({id}) => {
                    expect(id).to.equal(session_rebills.rebills[0].id);
                    return Promise.resolve([]);
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listTransactions(session).then((result) => {
                expect(result).to.deep.equal(null);
            });
        });

        it('returns null when there aren\'t any rebill transactions', () => {

            let session = getValidSession();

            let session_rebills = {
                rebills: [{
                    id: 'dummy_id'
                }]
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), {
                listBySession: (session) => {
                    return Promise.resolve(session_rebills);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), {
                listTransactionsByRebillID: ({id}) => {
                    expect(id).to.equal(session_rebills.rebills[0].id);
                    return Promise.resolve();
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listTransactions(session).then((result) => {
                expect(result).to.deep.equal(null);
            });
        });

        it('returns list of transactions', () => {

            let session = getValidSession();

            let session_rebills = {
                rebills: [{
                    id: 'dummy_id'
                }]
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), {
                listBySession: (session) => {
                    return Promise.resolve(session_rebills);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), {
                listTransactionsByRebillID: ({id}) => {
                    expect(id).to.equal(session_rebills.rebills[0].id);
                    return Promise.resolve(['a_transaction']);
                }
            });

            let sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.listTransactions(session).then((result) => {
                expect(result).to.deep.equal(['a_transaction']);
            });
        });
    });
});