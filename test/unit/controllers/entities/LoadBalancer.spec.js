let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidLoadBalancer() {
    return {
        "id":"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
        "name": "Seed load balancer",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "merchantproviders":[
            {
                "id":"6c40761d-8919-4ad6-884d-6a46a776cfb9",
                "distribution":0.75
            },
            {
                "id":"79189a4a-ed89-4742-aa96-afcd7f6c08fb",
                "distribution":0.25
            }
        ],
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/LoadBalancer.js', () => {

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

    describe('listByMerchantProviderID', () => {

        it('lists load balancer by merchant provider', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([load_balancer]);
            });
        });

        it('returns an empty array when there are no loadbalancers with corresponding merchant provider id', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: []
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when there aren\'t any merchant providers', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            delete load_balancer.merchantproviders;

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when merchant providers don\'t have any data', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            load_balancer.merchantproviders = [];

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when merchant provider with specified id does not exist', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: 'dummy_id'};

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });
    });

    describe('getMerchantProviderConfigurations', () => {

        it('successfully retrieves merchant provider configurations', () => {
            let load_balancer = getValidLoadBalancer();

            let loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

            expect(loadBalancerController.getMerchantProviderConfigurations(load_balancer)).to.deep.equal([{
                distribution: load_balancer.merchantproviders[0].distribution,
                merchantprovider: load_balancer.merchantproviders[0].id
            },{
                distribution: load_balancer.merchantproviders[1].distribution,
                merchantprovider: load_balancer.merchantproviders[1].id
            }]);
        })
    });
});