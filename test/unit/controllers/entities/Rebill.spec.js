let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidRebill() {
    return MockEntities.getValidRebill()
}

describe('controllers/Rebill.js', () => {

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

    describe('listTransactions', () => {

        it('lists transactions by rebill', () => {
            let rebill = getValidRebill();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), {
                listTransactionsByRebillID: ({id}) => {
                    expect(id).to.equal(rebill.id);
                    return Promise.resolve(['a_transaction']);
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.listTransactions(rebill).then((result) => {
                expect(result).to.deep.equal(['a_transaction']);
            });
        });
    });

    describe('getParentSession', () => {

        it('successfully retrieves parent session', () => {
            let rebill = getValidRebill();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Session.js'), {
                get: ({id}) => {
                    expect(id).to.equal(rebill.parentsession);
                    return Promise.resolve('a_parent_session');
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.getParentSession(rebill).then((result) => {
                expect(result).to.equal('a_parent_session');
            });
        });

        it('returns null when rebill does not have a parent session', () => {
            let rebill = getValidRebill();

            delete rebill.parentsession;

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            expect(rebillController.getParentSession(rebill)).to.equal(null);
        });
    });

    describe('listBySession', () => {

        it('lists rebills by session', () => {
            let rebill = getValidRebill();

            let params = {
                session: {
                    id: 'dummy_id'
                },
                pagination: 0
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    expect(index).to.equal('parentsession-index');
                    expect(table).to.equal('rebills');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters.expression_attribute_values[':index_valuev']).to.equal(params.session.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [rebill]
                    });
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.listBySession(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    rebills: [rebill]
                });
            });
        });
    });

    describe('listByState', () => {

        it('lists rebills by state', () => {
            let rebill = getValidRebill();

            PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('rebills');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters.expression_attribute_values[':statev']).to.equal('a_state');
                    return Promise.resolve({
                        Count: 1,
                        Items: [rebill]
                    });
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.listByState({state: 'a_state', pagination: 0}).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    rebills: [rebill]
                });
            });
        });

        it('lists rebills by state changed before', () => {
            let rebill = getValidRebill();

            PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('rebills');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters.expression_attribute_values[':statechangedbeforev']).to.equal('a_state_changed_before');
                    return Promise.resolve({
                        Count: 1,
                        Items: [rebill]
                    });
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.listByState({state_changed_before: 'a_state_changed_before', pagination: 0}).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    rebills: [rebill]
                });
            });
        });

        it('lists rebills by state changed after', () => {
            let rebill = getValidRebill();

            PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('rebills');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters.expression_attribute_values[':statechangedafterv']).to.equal('a_state_changed_after');
                    return Promise.resolve({
                        Count: 1,
                        Items: [rebill]
                    });
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.listByState({state_changed_after: 'a_state_changed_after', pagination: 0}).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    rebills: [rebill]
                });
            });
        });
    });

    describe('listProductSchedules', () => {

        it('successfully lists product schedules', () => {
            let rebill = getValidRebill();

            let product_schedule = 'a_product_schedule';

            let query_params = {
                filter_expression: 'a_filter',
                expression_attribute_values: 'an_expression_values'
            };

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                createINQueryParameters: (field, list_array) => {
                    expect(field).to.equal('id');
                    expect(list_array).to.deep.equal(rebill.product_schedules);
                    return Promise.resolve(query_params)
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/ProductSchedule.js'), {
                listByAccount: ({query_parameters}) => {
                    return Promise.resolve({productschedules: [product_schedule]});
                }
            });

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.listProductSchedules(rebill).then((result) => {
                expect(result).to.deep.equal([product_schedule]);
            });
        });
    });

    describe('getRebillsAfterTimestamp', () => {

        it('successfully lists rebills after timestamp', () => {
            const stamp = timestamp.createDate();
            const isoStamp = timestamp.castToISO8601(stamp);

            let rebill = getValidRebill();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(table).to.equal('rebills');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':timestamp_iso8601v']).to.equal(isoStamp);
                    expect(parameters.expression_attribute_values[':processingv']).to.equal('true');

                    return Promise.resolve({
                        Count: 1,
                        Items: [rebill]
                    });
                }
            });

            const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

            PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

            let rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

            return rebillController.getRebillsAfterTimestamp(stamp).then((result) => {
                expect(result.length).to.equal(1);
                expect(result[0]).to.deep.equal(rebill);
            });

        });
    });
});
