let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidProductSchedule() {
    return {
        "id":"12529a17-ac32-4e46-b05b-83862843055d",
        "name":"Product Schedule 1",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "loadbalancer":"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
        "schedule":[
            {
                "product_id":"616cc994-9480-4640-b26c-03810a679fe3",
                "price":4.99,
                "start":0,
                "end":14,
                "period":14
            },
            {
                "product_id":"be992cea-e4be-4d3e-9afa-8e020340ed16",
                "price":34.99,
                "start":14,
                "period":30
            }
        ],
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/ProductSchedule.js', () => {

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

    describe('listByProduct', () => {

        it('lists product schedules by product', () => {
            let params = {
                product: {
                    id: '616cc994-9480-4640-b26c-03810a679fe3'
                },
                pagination: 0
            };

            let product_schedule = getValidProductSchedule();

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('productschedules');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    return Promise.resolve({
                        Items: [product_schedule]
                    });
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.listByProduct(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    productschedules: [product_schedule]
                });
            });
        });

        it('returns empty product schedule list when product does not have any', () => {
            let params = {
                product: {
                    id: '616cc994-9480-4640-b26c-03810a679fe3'
                },
                pagination: 0
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('productschedules');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    return Promise.resolve({
                        Items: []
                    });
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.listByProduct(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 0,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    productschedules: []
                });
            });
        });

        it('returns empty product schedule list when there are no schedules', () => {
            let params = {
                product: {
                    id: '616cc994-9480-4640-b26c-03810a679fe3'
                },
                pagination: 0
            };

            let product_schedule = getValidProductSchedule();

            product_schedule.schedule = [];

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('productschedules');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    return Promise.resolve({
                        Items: [product_schedule]
                    });
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.listByProduct(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 0,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    productschedules: []
                });
            });
        });

        it('returns empty product schedule list when schedule with expected product id does not exist', () => {
            let params = {
                product: {
                    id: '616cc994-9480-4640-b26c-03810a679fe3'
                },
                pagination: 0
            };

            let product_schedule = getValidProductSchedule();

            product_schedule.schedule[0].product_id = 'dummy_id';

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('productschedules');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    return Promise.resolve({
                        Items: [product_schedule]
                    });
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.listByProduct(params).then((result) => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: 0,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    },
                    productschedules: []
                });
            });
        });
    });

    describe('getLoadBalancer', () => {

        it('successfully retrieves loadbalancer', () => {

            let product_schedule = getValidProductSchedule();

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/LoadBalancer.js'), {
                get: ({id}) => {
                    expect(id).to.equal(product_schedule.loadbalancer);
                    return Promise.resolve('a_loadbalancer');
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.getLoadBalancer(product_schedule).then((result) => {
                expect(result).to.equal('a_loadbalancer');
            });
        });

        it('returns null when product schedule does not have a loadbalancer', () => {

            let product_schedule = getValidProductSchedule();

            delete product_schedule.loadbalancer;

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.getLoadBalancer(product_schedule).then((result) => {
                expect(result).to.equal(null);
            });
        });
    });

    describe('getProduct', () => {

        it('successfully retrieves product', () => {

            let product_schedule = getValidProductSchedule();

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Product.js'), {
                get: ({id}) => {
                    expect(id).to.equal(product_schedule.product);
                    return Promise.resolve('a_product');
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.getProduct(product_schedule).then((result) => {
                expect(result).to.equal('a_product');
            });
        });
    });

    describe('getProducts', () => {

        it('successfully retrieves products list', () => {

            let product_schedule = getValidProductSchedule();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                createINQueryParameters: (field, list_array) => {
                    expect(field).to.equal('id');
                    expect(list_array[0]).to.deep.equal(product_schedule.schedule[0].product_id);
                    expect(list_array[1]).to.deep.equal(product_schedule.schedule[1].product_id);
                    return Promise.resolve({
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    })
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Product.js'), {
                listByAccount: ({query_parameters}) => {
                    return Promise.resolve(['a_product']);
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.getProducts(product_schedule).then((result) => {
                expect(result).to.deep.equal(['a_product']);
            });
        });
    });

    describe('listProductSchedulesByList', () => {

        it('successfully lists product schedules by their ids', () => {

            let product_schedule = getValidProductSchedule();

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                createINQueryParameters: (field, list_array) => {
                    expect(field).to.equal('id');
                    expect(list_array).to.deep.equal([product_schedule.id]);
                    return Promise.resolve({
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    })
                },
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('productschedules');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters.filter_expression).to.equal('a_filter');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values).to.equal('an_expression_values');
                    return Promise.resolve([product_schedule]);
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.listProductSchedulesByList({product_schedules: [product_schedule.id]}).then((result) => {
                expect(result).to.deep.equal([product_schedule]);
            });
        });
    });

    describe('listByLoadBalancer', () => {

        it('successfully lists product schedules by load balancer', () => {

            let product_schedule = getValidProductSchedule();

            let params = {
                loadbalancer: {
                    id: 'dummy_id'
                },
                pagination: 0
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('productschedules');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':loadbalancer_id']).to.equal(params.loadbalancer.id);
                    return Promise.resolve([product_schedule]);
                }
            });

            let productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');

            return productScheduleController.listByLoadBalancer(params).then((result) => {
                expect(result).to.deep.equal([product_schedule]);
            });
        });
    });
});